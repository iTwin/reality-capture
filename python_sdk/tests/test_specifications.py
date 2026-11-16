import pytest
from unittest.mock import patch, MagicMock
import reality_capture.specifications.production as production


class TestSpecifications:

    def test_export_options_parsing(self):
        export_obj_dict = {"format": "OBJ",
                           "name": "Production_5",
                           "options": {
                               "textureColorSource": "Visible",
                           }
                           }
        export_create_obj = production.ExportCreate(**export_obj_dict)
        assert isinstance(export_create_obj.options, production.OptionsOBJ)

        export_3dtiles_dict = {"format": "3DTiles",
                               "name": "Production_5",
                               "options": {
                                   "textureColorSource": "Visible",
                               }
                               }
        export_create_3dtiles = production.ExportCreate(**export_3dtiles_dict)
        assert isinstance(export_create_3dtiles.options, production.Options3DTiles)

        export_3mx_dict = {"format": "3MX", "name": "My3MX", "options": {"crs": "EPSG:4978"}}
        export_create_3mx = production.ExportCreate(**export_3mx_dict)
        assert isinstance(export_create_3mx.options, production.Options3MX)

        export_i3s_dict = {"format": "I3S", "name": "MyI3S", "options": {"crs": "EPSG:4978"}}
        export_create_i3s = production.ExportCreate(**export_i3s_dict)
        assert isinstance(export_create_i3s.options, production.OptionsI3S)

        export_las_dict = {"format": "LAS", "name": "MyLas", "options": {"crs": "EPSG:4978"}}
        export_create_las = production.ExportCreate(**export_las_dict)
        assert isinstance(export_create_las.options, production.OptionsLAS)

        export_ply_dict = {"format": "PLY", "name": "MyPly", "options": {"crs": "EPSG:4978"}}
        export_create_ply = production.ExportCreate(**export_ply_dict)
        assert isinstance(export_create_ply.options, production.OptionsPLY)

        export_opc_dict = {"format": "OPC", "name": "MyOpc", "options": {"crs": "EPSG:4978"}}
        export_create_opc = production.ExportCreate(**export_opc_dict)
        assert isinstance(export_create_opc.options, production.OptionsOPC)

        export_odsm_dict = {"format": "OrthophotoDSM", "name": "MyOdsm", "options": {"crs": "EPSG:4978"}}
        export_create_odsm = production.ExportCreate(**export_odsm_dict)
        assert isinstance(export_create_odsm.options, production.OptionsOrthoDSM)

        thermal_export = production.ExportCreate(
            format=production.Format.ORTHOPHOTO_DSM,
            options={"temperatureMapFormat": "GeoTIFF"},
        )
        assert thermal_export.options.temperature_map_format is production.TemperatureMapFormat.GEOTIFF
        assert thermal_export.model_dump(mode="json", by_alias=True, exclude_none=True)["options"]["temperatureMapFormat"] == "GeoTIFF"
        disabled_options = production.OptionsOrthoDSM(temperatureMapFormat="None")
        assert disabled_options.temperature_map_format is production.TemperatureMapFormat.NONE
        assert disabled_options.model_dump(mode="json", by_alias=True)["temperatureMapFormat"] == "None"
        with pytest.raises(ValueError):
            production.OptionsOrthoDSM(temperatureMapFormat="JPEG")

        export_osgb_dict = {"format": "OSGB", "name": "MyOsgb", "options": {"crs": "EPSG:4978"}}
        export_create_osgb = production.ExportCreate(**export_osgb_dict)
        assert isinstance(export_create_osgb.options, production.OptionsOSGB)

    def test_export_options_from_object(self):
        construct_from_object = production.ExportCreate(format=production.Format.OBJ, options=production.OptionsOBJ())

    @pytest.mark.parametrize("fmt", list(production.TemperatureMapFormat))
    def test_temperature_map_format_roundtrip(self, fmt):
        options = production.OptionsOrthoDSM(temperatureMapFormat=fmt)
        export = production.ExportCreate(format=production.Format.ORTHOPHOTO_DSM, options=options)
        assert export.options.temperature_map_format is fmt
        payload = export.model_dump(mode="json", by_alias=True, exclude_none=True)
        assert payload["options"]["temperatureMapFormat"] == fmt.value
        restored = production.ExportCreate.model_validate_json(export.model_dump_json(by_alias=True))
        assert restored.options.temperature_map_format is fmt

    def test_temperature_map_format_omitted(self):
        options = production.OptionsOrthoDSM()
        assert options.temperature_map_format is None
        assert "temperatureMapFormat" not in options.model_dump(mode="json", by_alias=True, exclude_none=True)
        assert options.temperature_map_unit is None
        assert options.temperature_map_no_data_value is None
        payload = options.model_dump(mode="json", by_alias=True, exclude_none=True)
        assert "temperatureMapUnit" not in payload
        assert "temperatureMapNoDataValue" not in payload

    @pytest.mark.parametrize("unit", list(production.ThermalUnit))
    @pytest.mark.parametrize("no_data_value", [-9999.0, 0.0, -273.15])
    def test_temperature_map_options_roundtrip(self, unit, no_data_value):
        options = production.OptionsOrthoDSM(
            temperatureMapFormat=production.TemperatureMapFormat.GEOTIFF,
            temperatureMapUnit=unit,
            temperatureMapNoDataValue=no_data_value,
        )
        export = production.ExportCreate(format=production.Format.ORTHOPHOTO_DSM, options=options)
        payload = export.model_dump(mode="json", by_alias=True, exclude_none=True)
        assert payload["options"]["temperatureMapUnit"] == unit.value
        assert payload["options"]["temperatureMapNoDataValue"] == no_data_value
        restored = production.ExportCreate.model_validate_json(export.model_dump_json(by_alias=True))
        assert restored.options.temperature_map_unit is unit
        assert restored.options.temperature_map_no_data_value == no_data_value

    def test_temperature_map_options_from_json(self):
        export = production.ExportCreate.model_validate({
            "format": "OrthophotoDSM",
            "options": {"temperatureMapUnit": "Fahrenheit", "temperatureMapNoDataValue": -123.5},
        })
        assert export.options.temperature_map_unit is production.ThermalUnit.FAHRENHEIT
        assert export.options.temperature_map_no_data_value == -123.5
        with pytest.raises(ValueError):
            production.OptionsOrthoDSM(temperatureMapUnit="Kelvin")
        with pytest.raises(ValueError):
            production.OptionsOrthoDSM(temperatureMapNoDataValue="invalid")

    def test_validate_options_unsupported_format_raises_value_error(self):
        with patch.object(production, "Format") as mock_format:
            # Make Format(value) return a sentinel that matches no branch in validate_options
            unsupported = MagicMock(name="UnsupportedFormat")
            mock_format.return_value = unsupported
            mock_format.THREED_TILES = production.Format.THREED_TILES
            mock_format.OBJ = production.Format.OBJ
            mock_format.THREEMX = production.Format.THREEMX
            mock_format.I3S = production.Format.I3S
            mock_format.OSGB = production.Format.OSGB
            mock_format.LAS = production.Format.LAS
            mock_format.PLY = production.Format.PLY
            mock_format.OPC = production.Format.OPC
            mock_format.ORTHOPHOTO_DSM = production.Format.ORTHOPHOTO_DSM

            with pytest.raises(Exception) as exc_info:
                production.ExportCreate(**{"format": "3DTiles", "options": {"crs": "EPSG:4978"}})

            # Pydantic wraps ValueError in ValidationError, check the cause
            assert "Unsupported format type" in str(exc_info.value)
