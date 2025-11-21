# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import json
from contextscene.ContextScene import ContextScene

'''
Check the validity of a created context scene
This script only open the context scene in order to create the object Context scene than save it again

'''

INPUT = "C:/Path/To/existing/ContextScene.json"
OUTPUT = "P:/Path/To/output"


def main():

    cs = ContextScene.open_context_scene(INPUT)

    cs.save_json_contextscene(OUTPUT)


if __name__ == '__main__':
    main()
