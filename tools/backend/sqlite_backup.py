#!/usr/bin/env python3
"""Create or restore an integrity-checked SQLite backup using the stdlib API."""
from __future__ import annotations
import argparse, hashlib, json, sqlite3
from pathlib import Path

def integrity(path: Path) -> str:
    connection=sqlite3.connect(path)
    try: return str(connection.execute('PRAGMA integrity_check').fetchone()[0])
    finally: connection.close()

def backup(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    src=sqlite3.connect(source); dst=sqlite3.connect(destination)
    try: src.backup(dst)
    finally: dst.close(); src.close()
    if integrity(destination) != 'ok': raise SystemExit('backup integrity check failed')
    print(json.dumps({'operation':'backup','path':str(destination),'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()}))

def restore(source: Path, destination: Path) -> None:
    if integrity(source) != 'ok': raise SystemExit('source backup integrity check failed')
    destination.parent.mkdir(parents=True, exist_ok=True)
    src=sqlite3.connect(source); dst=sqlite3.connect(destination)
    try: src.backup(dst)
    finally: dst.close(); src.close()
    if integrity(destination) != 'ok': raise SystemExit('restored database integrity check failed')
    print(json.dumps({'operation':'restore','path':str(destination),'sha256':hashlib.sha256(destination.read_bytes()).hexdigest()}))

parser=argparse.ArgumentParser(); parser.add_argument('operation',choices=['backup','restore']); parser.add_argument('source',type=Path); parser.add_argument('destination',type=Path); args=parser.parse_args()
(backup if args.operation=='backup' else restore)(args.source,args.destination)
