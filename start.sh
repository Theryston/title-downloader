#!/bin/sh
sonic -c /etc/sonic.cfg &
pnpm run start
