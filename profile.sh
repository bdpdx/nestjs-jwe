#!/bin/bash

curl http://localhost:4000/profile -H "Authorization: Bearer $1"
