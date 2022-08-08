

from features import Feature
import pathlib
import json

CONFIG_DIR_STR = __file__+"/../../configs/"

CONFIG_DIR = pathlib.Path(CONFIG_DIR_STR).resolve().__str__()

class PackageBuilder(Feature):
    def __init__(self) -> None:
        self._status = 0
        self._name =  ''
        self._data = None
        self._error = None
        self._config = None
        self._result = None
        super().__init__()

    def open(self) -> bool:
        """
        Read data from the config variable and feature data from where-ever.
        store the data in self._data, this is where most of the feature's functionality will read
        when looking for data specific to the feature. in this case,
        package lists in a table.
        1) Open the configuration file to read all the necessary constraints,
        2) Organise data into a table with "inverters", "batteries" and "solar" etc, (store it in self._data)
        3) 

        i.e: You'll know how your data looks, so you'll handle it accordingly.
        """
        with open(CONFIG_DIR+'/package_configs.json') as f:
            config = json.load(f)
        print(config)


        return super().open()

    def init(self, name, config, data) -> None:
        """
        We'll initialise variables in this section and deal with any other extras that we may need to initialise,
        as well as validation. 

        Later we'll implement a "feature" validation rule for security purposes.
        """
        return super().init(name, config, data)
    
    def process(self) -> bool:
        """
        this is where we'll generate the different packages... and store them in a file to read for filtering later.
        We'll create all possible packages on first go, and unless status changes to 0 we'll read from the 
        json file and run a filter and give output everytime.
        """

        return super().process()
    
    def output(self) -> dict:
        """
        The output will be formed here.. in the form
        output = {
            'name':self._name,
            'data':self._result
        }
        this is the structure that the world will ever see...
        """
        return super().output()

    def error(self, err_m) -> bool:
        """
        Still meditating about the error handling methods that would best suit features in general
        """
        return super().error(err_m)


package_builder = PackageBuilder()

package_builder.open()