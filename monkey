#!/usr/bin/env python3

from asyncio import (
  Protocol,
  Event,
  get_running_loop,
  run,
  gather,
  create_task
)
from sys import stdin, stdout, stderr
from json import dumps, loads
from struct import pack, unpack
from abc import ABC
from enum import Enum, auto
from pathlib import Path

from asyncinotify import Inotify, Mask


class Field(Enum):
  LENGTH = auto()
  PAYLOAD = auto()

class Native(Protocol, ABC):
  FORMAT = "<I"

  def __init__(self):
    self._isReady = Event()
    self._isClosed = Event()

  @property
  def isReady(self): return self._isReady.wait()

  @property
  def isClosed(self): return self._isClosed.wait()

  def connection_made(self, transport):
    self.transport = transport
    self._isReady.set()

  def connection_lost(self, exception): self._isClosed.set()

class Reader(Native):
  LENGTH = 4

  def __init__(self, callback):
    super().__init__()
    self.callback = callback
    self.buffer = bytearray()
    self.expectation = Field.LENGTH
    self.length = self.LENGTH

  def data_received(self, data):
    self.buffer.extend(data)
    while len(self.buffer) >= self.length:
      field = self.buffer[:self.length]
      self.buffer = self.buffer[self.length:]
      match self.expectation:
        case Field.LENGTH:
          self.length, *_ = unpack(self.FORMAT, field)
          self.expectation = Field.PAYLOAD
        case Field.PAYLOAD:
          create_task(self.callback(loads(field.decode())))
          self.length = self.LENGTH
          self.expectation = Field.LENGTH

class Writer(Native):
  def send(self, message):
    payload = dumps(message).encode()
    self.transport.write(pack(self.FORMAT, len(payload)) + payload)

class Monkey:

  def __init__(self):
    self.task = None
    self.finished = Event()
    self.finished.set()

  async def __call__(self):
    loop = get_running_loop()
    __, self.writer = await loop.connect_write_pipe(Writer, stdout.buffer)
    __, self.reader \
      = await loop.connect_read_pipe(lambda: Reader(self.handle), stdin.buffer)
    await gather(self.reader.isClosed, self.writer.isClosed)

  async def handle(self, message):
    match message['type']:
      case 'test':
        self.confirm()
      case 'watch':
        self.task = create_task(self.watch(message['path']))
        self.confirm()
      case 'stop':
        if self.task: self.task.cancel()
        await self.finished.wait()
        self.confirm()
        self.reader.transport.close()
        self.writer.transport.close()

  def confirm(self):
    self.writer.send(dict(reply = True))

  async def watch(self, path):
    _path = Path(path)
    self.finished.clear()
    try:
      with Inotify() as inotify:
        inotify.add_watch(_path.parent, Mask.CLOSE_WRITE)
        async for notification in inotify:
          with open(path) as file:
            if notification.path.name == _path.name:
              self.writer.send(file.read())
    finally:
      self.finished.set()


if __name__ == '__main__': run(Monkey()())
