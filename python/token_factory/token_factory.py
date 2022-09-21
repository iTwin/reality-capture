# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import time
import typing
import requests
import hashlib
import base64
import webbrowser
import json
import random
import string
from bottle import run, request, route
from urllib.parse import quote
from datetime import datetime, timedelta
import threading


class Token:
    def __init__(self, access: str, refresh: str, token_type: str, valid_until: datetime):
        self._access = access
        self._refresh = refresh
        self._tok_type = token_type
        self._valid_until = valid_until

    def is_still_valid(self) -> bool:
        return datetime.now() < self._valid_until

    def get_auth(self):
        return self._tok_type + " " + self._access

    def get_refresh(self):
        return self._refresh


class TokenFactory:
    auth_code = ""

    def __init__(self, auth_point, token_point, redirect_url, client_id):
        self._auth_point = auth_point
        self._token_point = token_point
        self._client_id = client_id
        self._redirect_url = redirect_url

        letters = string.ascii_letters + string.digits
        self._code_verifier = ''.join(random.choice(letters) for _ in range(50))

        self._port = 8080
        self._tokens = {}  # keys = " ".join(scopes) / values = Token
        self._daemon = threading.Thread(name="Local Server",
                                        target=run,
                                        kwargs={'host': 'localhost', 'port': 8080, 'quiet': True})
        self._daemon.setDaemon(True)
        self._daemon.start()

    @staticmethod
    def _encode(s: str) -> str:
        url_safe_encoded_bytes = base64.urlsafe_b64encode(s.encode("utf-8"))
        return str(url_safe_encoded_bytes, "utf-8")

    def get_code_verifier(self) -> str:
        return self._code_verifier

    def get_code_challenge(self) -> str:
        code_challenge = hashlib.sha256(self.get_code_verifier().encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(code_challenge).decode('utf-8')
        code_challenge = code_challenge.replace('=', '')
        return code_challenge

    @staticmethod
    @route('/sign-oidc', method='GET')
    def get_code():
        TokenFactory.auth_code = request.query.get("code")
        if TokenFactory.auth_code is not None:
            return "Identification completed, you can now close this window."
        raise Exception("Could not get authentication code")

    @staticmethod
    def _get_token_from_data(data: dict) -> Token:
        valid = datetime.now() + timedelta(0, data["expires_in"] - 300)  # 5 minutes safe window
        return Token(data["access_token"], data.get("refresh_token"), data["token_type"], valid)

    def get_token(self, scopes: typing.List[str]):
        joined_scopes = " ".join(scopes)

        if joined_scopes in self._tokens.keys() and self._tokens[joined_scopes].is_still_valid():
            # We already have a token and it is valid, hurray!
            return self._tokens[joined_scopes].get_auth()

        if joined_scopes in self._tokens.keys() and self._tokens[joined_scopes].get_refresh():
            # We have a token that is too old and a refresh information, let's try to refresh it
            client_id_with_colon = "Basic " + self._encode(self._client_id + ':')
            req = requests.Request('POST', self._token_point,
                                   headers={"Authorization": client_id_with_colon},
                                   data={"grant_type": "refresh_token",
                                         "refresh_token": self._tokens[joined_scopes].get_refresh()})
            prepared = req.prepare()
            s = requests.session()
            r = s.send(prepared)
            if r.status_code == 200:
                t = self._get_token_from_data(json.loads(r.content.decode()))
                self._tokens[joined_scopes] = t
                return t.get_auth()

        # We can't use available tokens, we need to ask the user for their consent for a new token
        TokenFactory.auth_code = ""  # Reset code
        webbrowser.open_new("{}?"
                            "response_type={}"
                            "&client_id={}"
                            "&scope={}"
                            "&redirect_uri={}"
                            "&state={}"
                            "&code_challenge={}"
                            "&code_challenge_method={}"
                            .format(self._auth_point,
                                    "code",
                                    quote(self._client_id, safe=""),
                                    quote(" ".join(scopes), safe=""),
                                    quote(self._redirect_url, safe=""),
                                    "foobar",
                                    self.get_code_challenge(),
                                    "S256"))
        while not TokenFactory.auth_code:
            time.sleep(0.5)

        client_id_with_colon = "Basic " + self._encode(self._client_id + ':')
        req = requests.Request('POST', self._token_point,
                               headers={"Authorization": client_id_with_colon},
                               data={"grant_type": "authorization_code",
                                     "code": TokenFactory.auth_code,
                                     "redirect_uri": self._redirect_url,
                                     "scope": " ".join(scopes),
                                     "code_verifier": self.get_code_verifier()})
        prepared = req.prepare()
        s = requests.session()
        r = s.send(prepared)

        if r.status_code != 200:
            return ""

        token = self._get_token_from_data(json.loads(r.content.decode()))
        self._tokens[joined_scopes] = token
        return token.get_auth()


class ServiceTokenFactory(TokenFactory):
    def __init__(self, client_id, ims_server, scope_list):
        super().__init__("https://" + ims_server + "/connect/authorize", "https://" + ims_server + "/connect/token",
                            "http://localhost:8080/sign-oidc", client_id)
        self.scope_list = scope_list

    def get_read_token(self):
        return self.get_token(self.scope_list)

    def get_modify_token(self):
        return self.get_token(self.scope_list)

