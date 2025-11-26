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

    def test_export_options_from_object(self):
        construct_from_object = production.ExportCreate(format=production.Format.OBJ, options=production.OptionsOBJ())
