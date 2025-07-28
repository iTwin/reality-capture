import reality_capture.specifications.production  as production 

class TestSpecifications:

    def test_export_options_parsing(self):
        export_3sm_dict = { "format" : "3SM",
                            "name" : "Production_5",
                            "options" : {
                                "textureColorSource" : "Visible",
                            }
                          }
        export_create_3sm = production.ExportCreate(**export_3sm_dict) 
        assert isinstance(export_create_3sm.options, production.Options3SM)

        export_3DTiles_dict = { "format" : "3DTiles",
                            "name" : "Production_5",
                            "options" : {
                                "textureColorSource" : "Visible",
                            }
                          }
        export_create_3DTiles = production.ExportCreate(**export_3DTiles_dict) 
        assert isinstance(export_create_3DTiles.options, production.Options3DTiles)
