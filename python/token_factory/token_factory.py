# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.
import time
import hashlib
import base64
import webbrowser
import random
import string
import threading

from abc import abstractmethod

from bottle import run, request, route
from urllib.parse import quote
from datetime import datetime, timedelta

from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import WebApplicationClient, BackendApplicationClient


class ClientInfo:
    def __init__(self, client_id, scope_set, env="",
                 redirect_url="http://localhost:8080/sign-oidc", secret=""):
        self.env = env
        self.redirect_url = redirect_url
        self.client_id = client_id
        self.scope_set = scope_set
        self.secret = secret


class AccessToken:
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


class AbstractTokenFactory:

    @abstractmethod
    def get_token(self):
        pass

    @abstractmethod
    def get_service_url(self):
        pass

    @abstractmethod
    def is_ok(self):
        pass


class BaseTokenFactory(AbstractTokenFactory):
    auth_code = ""
    qa_auth_code = ""
    dev_auth_code = ""

    def __init__(self, client_info):
        self._client_id = client_info.client_id
        self._scope_set = client_info.scope_set
        self._env = client_info.env
        self._redirect_url = client_info.redirect_url
        self._secret = client_info.secret
        if not self._env:
            ims_server = "ims.bentley.com"
        else:
            ims_server = "qa-ims.bentley.com"
        self._auth_point = "https://" + ims_server + "/connect/authorize"
        self._token_point = "https://" + ims_server + "/connect/token"

        self._token = None
        self._session = None

    @staticmethod
    def _get_token_from_data(data: dict) -> AccessToken:
        valid = datetime.now() + timedelta(0, data["expires_in"] - 300)  # 5 minutes safe window
        return AccessToken(data["access_token"], data.get("refresh_token"), data["token_type"], valid)

    @staticmethod
    @route('/sign-oidc', method='GET')
    def get_code():
        BaseTokenFactory.auth_code = request.query.get("code")
        if BaseTokenFactory.auth_code is not None:
            return "Identification completed, you can now close this window."
        raise Exception("Could not get authentication code")

    @abstractmethod
    def get_token(self):
        pass

    def get_service_url(self):
        if self._env == "qa":
            return "qa-api.bentley.com"
        if self._env == "dev":
            return "dev-api.bentley.com"
        return "api.bentley.com"

    def is_ok(self):
        return self._session.authorized()


class SpaDesktopMobileTokenFactory(BaseTokenFactory):

    def __init__(self, client_info):
        super().__init__(client_info)

        letters = string.ascii_letters + string.digits
        self._code_verifier = ''.join(random.choice(letters) for _ in range(50))

        self._port = 8080
        self._token = None
        self._daemon = threading.Thread(name="Local Server",
                                        target=run,
                                        kwargs={'host': 'localhost', 'port': 8080, 'quiet': True})
        self._daemon.setDaemon(True)
        self._daemon.start()

        self._client = WebApplicationClient(self._client_id)
        self._session = OAuth2Session(client=self._client, redirect_uri=self._redirect_url,
                                      scope=list(self._scope_set))

    def _get_code_verifier(self) -> str:
        return self._code_verifier

    def _get_code_challenge(self) -> str:
        code_challenge = hashlib.sha256(self._get_code_verifier().encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(code_challenge).decode('utf-8')
        code_challenge = code_challenge.replace('=', '')
        return code_challenge

    def get_token(self):
        if self._token is not None and self._token.is_still_valid():
            return self._token.get_auth()

        if self._token is not None and self._token.get_refresh():
            token_data = self._session.refresh_token(self._token_point,
                                                     client_id=self._client_id)
            self._token = self._get_token_from_data(token_data)
            return self._token.get_auth()

        # token is not usable, we need to ask the user for their consent for a new token
        BaseTokenFactory.auth_code = ""  # Reset code

        authorization_url, _ = self._session.authorization_url(self._auth_point,
                                                               code_challenge=self._get_code_challenge(),
                                                               code_challenge_method="S256")
        webbrowser.open_new(authorization_url)
        # waiting for new authorization code
        while not BaseTokenFactory.auth_code:
            time.sleep(0.5)

        # asking for new token
        token_data = self._session.fetch_token(self._token_point,
                                               code=BaseTokenFactory.auth_code,
                                               code_verifier=quote(self._code_verifier, safe=""))
        self._token = self._get_token_from_data(token_data)
        return self._token.get_auth()


class ServiceTokenFactory(BaseTokenFactory):

    def __init__(self, client_info):
        super().__init__(client_info)

        self._client = BackendApplicationClient(self._client_id)
        self._session = OAuth2Session(client=self._client, scope=list(self._scope_set))

    def get_token(self):

        if self._token is not None and self._token.is_still_valid():
            return self._token.get_auth()
        # token is not usable, we need a new token
        # asking for new token
        token_data = self._session.fetch_token(self._token_point, client_secret=self._secret, include_client_id=True, scope=self._scope_set)

        self._token = self._get_token_from_data(token_data)
        return self._token.get_auth()


class WebTokenFactory(BaseTokenFactory):

    def __init__(self, client_info):
        super().__init__(client_info)

        self._port = 8080
        self._token = None
        self._daemon = threading.Thread(name="Local Server",
                                        target=run,
                                        kwargs={'host': 'localhost', 'port': 8080, 'quiet': True})
        self._daemon.setDaemon(True)
        self._daemon.start()

        self._client = WebApplicationClient(self._client_id)
        self._session = OAuth2Session(client=self._client, redirect_uri=self._redirect_url,
                                      scope=list(self._scope_set))

    def get_token(self):
        if self._token is not None and self._token.is_still_valid():
            return self._token.get_auth()

        if self._token is not None and self._token.get_refresh():
            token_data = self._session.refresh_token(self._token_point,
                                                     client_id=self._client_id,
                                                     client_secret=self._secret)
            self._token = self._get_token_from_data(token_data)
            return self._token.get_auth()

        # token is not usable, we need to ask the user for their consent for a new token
        BaseTokenFactory.auth_code = ""  # Reset code
        authorization_url, _ = self._session.authorization_url(self._auth_point)
        webbrowser.open_new(authorization_url)
        # waiting for new authorization code
        while not BaseTokenFactory.auth_code:
            time.sleep(0.5)

        # asking for new token
        token_data = self._session.fetch_token(self._token_point,
                                               code=BaseTokenFactory.auth_code,
                                               client_secret=self._secret,
                                               include_client_id=True)
        self._token = self._get_token_from_data(token_data)
        return self._token.get_auth()

