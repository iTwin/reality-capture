import copy
import rdas_sdk.job_settings
import references
from utils import ReturnValue


def convert_to_cloud_settings(settings: rdas_sdk.job_settings.JobSettings, references: references.ReferenceTable) -> ReturnValue[rdas_sdk.job_settings.JobSettings]:
    """
    Takes settings filled with local paths, and changes those paths to their corresponding cloud ID

    Only input settings are properly converted, this should only be used to convert settings before submission

    :param references:
    :param settings: Settings containing local paths that should be converted
    :return: Settings filled with corresponding cloud IDs, and a potential error message
    """
    new_settings = copy.deepcopy(settings)
    for name, value in vars(settings.inputs).items():
        trans_input = references._translate_input_path(value)
        if trans_input.is_error():
            return ReturnValue(value=new_settings, error=trans_input.error)
        new_settings.inputs.__setattr__(name, trans_input.value)
    for name, value in vars(settings.outputs).items():
        new_settings.outputs.__setattr__(name, references._translate_output_path(value))
    return ReturnValue(value=new_settings, error="")