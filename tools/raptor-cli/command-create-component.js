var File = require('raptor/files/File'),
    files = require('raptor/files'),
    path = require('path');

module.exports = function(args, config) {
    var longName = null,
        ifWidget = true;

    require('optimist')(args)
        .usage('Usage: $0 create component <component-name> [options]\n')
        .boolean('no-widget')
        .describe('no-widget', 'Do not generate a widget')
        .check(function(argv) {
            longName = argv._[0];
            if (!longName) {
                throw 'Component name is required';
            }
            
            if (argv['widget'] === false) {
                ifWidget = false;
            }
        })
        .argv; 

    var scaffoldDir = config["scaffold.component.dir"];
    if (!scaffoldDir) {
        console.error('"scaffold.component.dir" not defined in raptor config file');
        return;
    }

    scaffoldDir = new File(scaffoldDir);
    if (!scaffoldDir.exists()) {
        console.error('Invalid value for "scaffold.component.dir". The directory at path "' + scaffoldDir.getAbsolutePath() + '" does not exist.');
        return;
    }

    var baseDir = config['components.base.dir'] || process.cwd();
    var outputDir = path.join(baseDir, longName);
    var moduleName = config['module.name'];
    if (moduleName) {
        longName = moduleName + '/' + longName;
    }
    
    var lastSlash = longName.lastIndexOf('/'),
        shortName = lastSlash === -1 ? longName : longName.slice(lastSlash+1),
        shortNameLower = shortName.toLowerCase(),
        shortNameDashSeparated = shortName.replace(/([a-z])([A-Z])/g, function(match, a, b) {
            return a + '-' + b;
        }).toLowerCase();

    require('./scaffolding').generate(
        {
            scaffoldDir: scaffoldDir,
            outputDir: outputDir,
            viewModel: {
                ifWidget: ifWidget,
                longName: longName,
                shortName: shortName,
                shortNameLower: shortNameLower,
                shortNameDashSeparated: shortNameDashSeparated
            },
            afterFile: function(outputFile) {
                // Register RTLD files in the app.rtld file
                if (outputFile.getExtension() === 'rtld') {
                    var appRtldPath = config["rtld.file"];
                    
                    

                    if (appRtldPath) {
                        var appRtldFile = new File(appRtldPath);
                        var rtldXml = appRtldFile.readAsString();
                        var componentRtldPath = path.relative(appRtldFile.getParent(), outputFile.getAbsolutePath());
                        
                        var newTaglibElement = '<import-taglib path="' + componentRtldPath + '"/>';
                        if (rtldXml.indexOf(newTaglibElement) === -1) {
                            console.log('Adding ' + newTaglibElement + ' to "' + appRtldFile.getAbsolutePath() + '"...');
                            rtldXml = rtldXml.replace('</raptor-taglib>', '    ' + newTaglibElement  + '\n</raptor-taglib>');
                            appRtldFile.writeAsString(rtldXml);
                        }
                    }
                }
            }
        });
    console.log('UI component written to "' + outputDir + '"');
}