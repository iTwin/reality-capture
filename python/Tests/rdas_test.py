# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os


def test_env_var():
    # Get environment variables
    project_id = os.getenv('IMJS_PROJECT_ID')
    client_id = os.getenv('IMJS_CLIENT_ID')
    secret = os.getenv('IMJS_SECRET')

    print("project_id is:", project_id)
    print("client_id is:", client_id)

    assert project_id is not None
    assert client_id is not None
    assert secret is not None
