#!/bin/sh

SCHEMA=$1;

ajv test -r definitions/definitions.schema.json -r condition/condition.schema.json -s $SCHEMA/$SCHEMA.schema.json -d \'$SCHEMA/data/valid/**.json\' --valid