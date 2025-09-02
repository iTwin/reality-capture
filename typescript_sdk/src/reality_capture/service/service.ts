import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { BucketResponse } from './bucket';
import { DetectorsMinimalResponse, DetectorResponse } from './detectors';
import { CostEstimationCreate, CostEstimation } from './estimation';
import { Files } from './files';
import { Response as SDKResponse } from './response';
import { JobCreate, Job, Progress, Messages, Service } from './job';
import {
  RealityDataCreate,
  RealityData,
  RealityDataUpdate,
  ContainerDetails,
  RealityDataFilter,
  Prefer,
  RealityDatas,
} from './reality_data';
import { DetailedErrorResponse, DetailedError } from './error';
import { __version__ } from './reality_capture'; // TODO
import { ValidationError } from 'class-validator'; // TODO
import { URLSearchParams } from 'url';

export class RealityCaptureService {
  private _tokenFactory: { get_token: () => string };
  private _session: AxiosInstance;
  private _header: Record<string, any>;
  private _service_url: string;

  constructor(tokenFactory: { get_token: () => string }, options?: { env?: string }) {
    this._tokenFactory = tokenFactory;
    this._session = axios.create();

    this._header = {
      Authorization: undefined,
      'User-Agent': `Reality Capture TypeScript SDK/${__version__}`,
      'Content-type': 'application/json',
      Accept: 'application/vnd.bentley.itwin-platform.v1+json',
    };

    let env = options?.env;
    if (env === 'qa') {
      this._service_url = 'https://qa-api.bentley.com/';
    } else if (env === 'dev') {
      this._service_url = 'https://dev-api.bentley.com/';
    } else {
      this._service_url = 'https://api.bentley.com/';
    }
  }

  private _get_header(version: string): Record<string, any> {
    this._header['Authorization'] = this._tokenFactory.get_token();
    this._header['Accept'] = `application/vnd.bentley.itwin-platform.${version}+json`;
    return this._header;
  }

  private _get_header_v1(): Record<string, any> {
    return this._get_header('v1');
  }

  private _get_header_v2(): Record<string, any> {
    return this._get_header('v2');
  }

  private _get_reality_management_rd_url(): string {
    return this._service_url + 'reality-management/reality-data/';
  }

  private _get_modeling_url(): string {
    return this._service_url + 'reality-modeling/';
  }

  private _get_analysis_url(): string {
    return this._service_url + 'realitydataanalysis/';
  }

  private _get_correct_url(service: Service): string {
    if (service === Service.MODELING) return this._get_modeling_url();
    if (service === Service.ANALYSIS) return this._get_analysis_url();
    throw new Error('Other services not yet implemented');
  }

  private static _get_ill_formed_message(response: AxiosResponse, exception: any): string {
    return `Service response is ill-formed: ${JSON.stringify(response.data)}. Exception : ${exception}`;
  }

  async submit_job(job: JobCreate): Promise<SDKResponse<Job>> {
    const url = this._get_correct_url(job.get_appropriate_service());
    try {
      const response = await this._session.post(url + '/jobs', job.modelDumpJson(true), {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Job.modelValidate(response.data.job),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_job(job_id: string, service: Service): Promise<SDKResponse<Job>> {
    const url = this._get_correct_url(service);
    try {
      const response = await this._session.get(url + '/jobs/' + job_id, {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Job.modelValidate(response.data.job),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_job_messages(job_id: string, service: Service): Promise<SDKResponse<Messages>> {
    const url = this._get_correct_url(service);
    try {
      const response = await this._session.get(url + '/jobs/' + job_id + '/messages', {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Messages.modelValidate(response.data.messages),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_job_progress(job_id: string, service: Service): Promise<SDKResponse<Progress>> {
    const url = this._get_correct_url(service);
    try {
      const response = await this._session.get(url + '/jobs/' + job_id + '/progress', {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Progress.modelValidate(response.data.progress),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async cancel_job(job_id: string, service: Service): Promise<SDKResponse<Job>> {
    const url = this._get_correct_url(service);
    try {
      const response = await this._session.delete(url + '/jobs/' + job_id, {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Job.modelValidate(response.data.job),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async estimate_cost(estimationCreate: CostEstimationCreate): Promise<SDKResponse<CostEstimation>> {
    const url = this._get_correct_url(estimationCreate.get_appropriate_service());
    try {
      const response = await this._session.post(url + '/costs', estimationCreate.modelDumpJson(true), {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: CostEstimation.modelValidate(response.data.costEstimation),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_bucket(itwin_id: string): Promise<SDKResponse<BucketResponse>> {
    try {
      const response = await this._session.get(this._get_correct_url(Service.MODELING) + `itwins/${itwin_id}/bucket`, {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: BucketResponse.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_service_files(): Promise<SDKResponse<Files>> {
    try {
      const response = await this._session.get(this._get_correct_url(Service.MODELING) + 'files', {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: Files.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_detectors(): Promise<SDKResponse<DetectorsMinimalResponse>> {
    try {
      const response = await this._session.get(this._get_correct_url(Service.ANALYSIS) + 'detectors', {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: DetectorsMinimalResponse.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_detector(detector_name: string): Promise<SDKResponse<DetectorResponse>> {
    try {
      const response = await this._session.get(this._get_correct_url(Service.ANALYSIS) + `detectors/${detector_name}`, {
        headers: this._get_header_v2(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: DetectorResponse.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async create_reality_data(reality_data: RealityDataCreate): Promise<SDKResponse<RealityData>> {
    try {
      const response = await this._session.post(
        this._get_reality_management_rd_url(),
        reality_data.modelDumpJson(true, true),
        { headers: this._get_header_v1() },
      );
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: RealityData.modelValidate(response.data.realityData),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_reality_data(reality_data_id: string, itwin_id?: string): Promise<SDKResponse<RealityData>> {
    let url = this._get_reality_management_rd_url() + reality_data_id;
    if (itwin_id !== undefined) {
      url += `?iTwinId=${itwin_id}`;
    }
    try {
      const response = await this._session.get(url, {
        headers: this._get_header_v1(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: RealityData.modelValidate(response.data.realityData),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async update_reality_data(
    reality_data_update: RealityDataUpdate,
    reality_data_id: string,
  ): Promise<SDKResponse<RealityData>> {
    const url = this._get_reality_management_rd_url() + reality_data_id;
    try {
      const response = await this._session.patch(url, reality_data_update.modelDumpJson(true, true), {
        headers: this._get_header_v1(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: RealityData.modelValidate(response.data.realityData),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async delete_reality_data(reality_data_id: string): Promise<SDKResponse<null>> {
    const url = this._get_reality_management_rd_url() + reality_data_id;
    try {
      const response = await this._session.delete(url, {
        headers: this._get_header_v1(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: null,
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_reality_data_write_access(reality_data_id: string, itwin_id?: string): Promise<SDKResponse<ContainerDetails>> {
    let url = this._get_reality_management_rd_url() + reality_data_id + '/writeaccess';
    if (itwin_id !== undefined) {
      url += `?iTwinId=${itwin_id}`;
    }
    try {
      const response = await this._session.get(url, {
        headers: this._get_header_v1(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: ContainerDetails.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async get_reality_data_read_access(reality_data_id: string, itwin_id?: string): Promise<SDKResponse<ContainerDetails>> {
    let url = this._get_reality_management_rd_url() + reality_data_id + '/readaccess';
    if (itwin_id !== undefined) {
      url += `?iTwinId=${itwin_id}`;
    }
    try {
      const response = await this._session.get(url, {
        headers: this._get_header_v1(),
      });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: ContainerDetails.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }

  async list_reality_data(
    reality_data_filter?: RealityDataFilter,
    prefer?: Prefer,
  ): Promise<SDKResponse<RealityDatas>> {
    let url = this._get_reality_management_rd_url();
    if (reality_data_filter !== undefined) {
      const params = reality_data_filter.asDictForServiceCall();
      const encoded_params = new URLSearchParams(params).toString();
      url = `${url}?${encoded_params}`;
    }
    const header = this._get_header_v1();
    header.Prefer = 'return=minimal';
    if (prefer === Prefer.REPRESENTATION) {
      header.Prefer = 'return=representation';
    }
    try {
      const response = await this._session.get(url, { headers: header });
      if (response.status >= 200 && response.status < 300) {
        return {
          status_code: response.status,
          value: RealityDatas.modelValidate(response.data),
          error: undefined,
        };
      }
      return {
        status_code: response.status,
        error: DetailedErrorResponse.modelValidate(response.data),
        value: undefined,
      };
    } catch (exception) {
      const error = new DetailedError('UnknownError', RealityCaptureService._get_ill_formed_message(exception.response, exception));
      return {
        status_code: exception.response?.status ?? 500,
        error: new DetailedErrorResponse(error),
        value: undefined,
      };
    }
  }
}