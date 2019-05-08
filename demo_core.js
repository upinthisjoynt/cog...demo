
/**
 * ****************************
 * UI SPECIFIC CODE...
 * ****************************
 */
let hb = Handlebars
, pageModule = (function () {
    /**
     * Method to get the model data
     */
    let fnGetPageData = function (callback){
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'data.json', true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null); 
    }
    /**
     * Method to handle the response and add the data to the page
     */
    , fnHandleResponse = function (response) {
        
        // set the global data variable
        oPageData = JSON.parse(response);

        // add the data to the page
        return fnDisplayTemplate(oPageData);
    }
    , oPageData
    , demoForm = document.getElementById("demo-form")
    /**
     * Method to display the data on the page
     */
    , fnDisplayTemplate = function (data) {
        let templateSource = document.getElementById("form-template").innerHTML
        , template = hb.compile(templateSource)
        , html = template(data)
        
        ;
        // add the data to the page
        demoForm.innerHTML = html;

        return true;
    }
    /**
     * Method to check the field data
     */
    , fnCheckField = function(evt) {
        
        let fieldName = evt.target.id
        , volume = oPageData.page.initiation.project_general.sub_groups.volume
        , fnGetField = function (field) {
            let fields = volume.fields
            , fieldsLen = fields.length || 0
            , i = 0
            ;

            // go through the fields
            for (; i < fieldsLen; i += 1) {
                if (fields[i].dataName === field) {
                    return fields[i];
                }
            }

            return false;
        }
        // check to see if the field has an action assigned to it
        // this should be written as a getter
        // hardcoding it for this example
        , field = fnGetField(fieldName)
        , actions = field.actions
        , actionField
        , value
        , fsRunCheck = function(whatIsIt) {
            if (whatIsIt === false) {
                document.getElementById(actionField).className = "";
            } else {
                document.getElementById(actionField).className = "required";
            }
        }
        ;

        // if there's an action, update the data
        if (actions){
           
            actionField = actions.field;
            /**
             * Method to run the operations for any particular field
             */
            value =  function() {
                let valSplit = actions.operation.split(" ")
                    , field1 = document.getElementById(valSplit[0]).value || 0
                    , field2 = (document.getElementById(valSplit[2])) ? document.getElementById(valSplit[2]).value : 0
                    , operator = valSplit[1] || '+'
                    , nF = new Function('a', 'b', "return parseFloat(a) " + operator +" parseFloat(b)")
                ;
                
                // run the operation
                return nF(field1, field2);
            };
            
            // set the value
            document.getElementById(actionField).value = value();
            
            
        }

        if (actions.check) {
            if (document.getElementById(actionField).value === "false") {

                fsRunCheck(false);
                
            } else {
                fsRunCheck(true);
            }
        }
    }
    ;

    // get the page data and display it
    fnGetPageData(fnHandleResponse);

    //listen for changes
    demoForm.addEventListener("change", fnCheckField);
    
    return true;
})();

;

/**
 * Method used for file downloads.
 * @method        fileSave
 * @property     {object}     oBlob         local blob object
 * @property     {function}     fileSave         Window blob
 * @property     {function}     fnIsIE         Method to check IE Version
 * @returns       {object}    Returns a new web worker
 * @author         Addam Driver <addam@devcrapshoot.com>
 * @namespace     fileSave
 * @example       <caption>Create a file to download from some text</caption>
 * fileSave.createFile({data: "this is the text for your file", filename: 'myawesomefile.csv'}); // creates a download file for the user
 */
var fileSave = function (context) {
    context = context || window;

    var oFileSave = context.Blob
        , fnIsIE = function () {
            var sUserAgent = window.navigator.userAgent
                , nMSIE = sUserAgent.indexOf('MSIE ')
                , nTrident = sUserAgent.indexOf('Trident/')
                , nEdge = sUserAgent.indexOf('Edge/')
                , nRV = sUserAgent.indexOf('rv:')
                , fnReturnInfo = function (nPosition, nBrand) {
                    // return the proper version
                    return parseInt(sUserAgent.substring(nBrand + nPosition, sUserAgent.indexOf('.', nBrand)), 10);
                }
                ;

            // if it's IE 10 or older || IE 12 +
            if (nMSIE > 0) {
                return fnReturnInfo(5, nMSIE);
            }

            // if IE 11
            if (nTrident > 0) {
                return fnReturnInfo(3, nRV);
            }

            // if IE Edge
            if (nEdge > 0) {
                return fnReturnInfo(5, nEdge);
            }

            return false;
        }()
        , fnEndsWith = function (sString, sEndsWith) {
            return sString.slice(-sEndsWith.length) === sEndsWith;
        }
        /**
         * Method to create a file download from a blob
         * @method        fnCreateFile
         * @param         {object}    oData                                         File configuration for the file download
         * @param         {object}     [oData.contentType = {type: 'octet/stream'}]     Content type for the file blob
         * @param         {string}     [oData.data = '']                             The string data to send to the file
         * @param         {string}     [oData.filename = 'export_(timestamp).csv']     Default file name for saving
         * @param         {string}     [oData.charset = 'utf-8']                     Charset for the file
         * @property     {string}    sData                                            Cache of the data content
         * @property     {object}     oBlob                                             New window blob
         * @property     {string}     sFileName                                         File name cache
         * @property     {object}     oTempA                                             Temporary HTML Acnchor
         * @property     {string}     sUrl                                             Local borwser url
         * @property     {string}     sTextContent                                     Content data fix for... IE9
         * @property     {string}     sCharset                                         Character set for the file... IE9
         * @property     {object}     oWindowContent                                     Object for window data... IE9
         * @property     {object}     oFrameDocument                                     Frame document object... IE9
         * @property     {object}     oFrameValue                                     iFrame content... IE9
         * @property     {number}     _FILE_REMOVE_TIME                                 Timeout value for removing the anchor
         * @property     {object}     oDocumentBody                                     Document body object
         * @returns       {object|string}        Content for the file or the file information itself
         * @author         Addam Driver <addam@devcrapshoot.com>
         * @memberOf      fileSave
         * <caption>Create a file to download from some text</caption>
          * fileSave.createFile({data: "this is the text for your file", filename: 'myawesomefile.csv'}); // creates a download file for the user
         */
        , fnCreateFile = function (oData) {
            oData = oData || {};
            var sData = oData.data || ''
                , oBlob = oFileSave && new Blob([sData], { type: "octet/stream" })
                , sFileName = oData.filename || 'export_' + new Date().getTime() + '.csv'
                , oTempA
                , sUrl
                , sTextContent
                , sCharset = oData.charset || 'utf-8'
                , oWindowContent
                , oFrameDocument
                , oFrameValue
                , _FILE_REMOVE_TIME = 100
                , oDocumentBody = document.body
                ;

            // if it's not IE
            if (!fnIsIE) {
                // for the cool browsers
                oTempA = document.createElement("a");
                oTempA.style = "display: none";
                sUrl = context.URL.createObjectURL(oBlob);
                oTempA.href = sUrl;
                oTempA.download = sFileName;
                oDocumentBody.appendChild(oTempA);
                oTempA.click();

                // timeout is for Firefox but it's not too bad
                setTimeout(function () {
                    context.URL.revokeObjectURL(sUrl);
                    oDocumentBody.removeChild(oTempA);
                }, _FILE_REMOVE_TIME);

                return;
            }

            // if is IS IE but newer than 9
            if (fnIsIE > 9) {
                return context.navigator.msSaveBlob(
                    new Blob([sData])
                    , sFileName
                );
            }

            // The rest of this... yeah... IE9
            // get the window frames
            oWindowContent = context.frames.oWindowContent;
            if (!oWindowContent) {
                oWindowContent = document.createElement('iframe');
                oWindowContent.id = 'oWindowContent';
                oWindowContent.style.display = 'none';
                oDocumentBody.insertBefore(oWindowContent, null);
                oWindowContent = context.frames.oWindowContent;

                // if for some reason the fame doesn't work, force the window.open thing
                if (!oWindowContent) {
                    oWindowContent = context.open('', '_temp', 'width=100,height=100');
                    if (!oWindowContent) {
                        console.warn('Sorry, download file could not be created.');
                        return false;
                    }
                }
            }

            // set the text content
            sTextContent = (sData || '').replace(/\r?\n/g, "\r\n");
            oFrameDocument = oWindowContent.document;
            oFrameDocument.open('text/plain', 'replace');
            oFrameDocument.charset = sCharset;

            if (fnEndsWith(sFileName, '.html')) {
                oFrameDocument.close();
                oFrameDocument.body.innerHTML = '\r\n' + sTextContent + '\r\n';
            } else {
                sFileName += ".txt";
                oFrameDocument.write(sTextContent);
                oFrameDocument.close();
            }

            oFrameValue = oFrameDocument.execCommand('SaveAs', null, sFileName);
            oWindowContent.close();

            return oFrameValue;
        }
        ;

    // return the create file method
    return {
        createFile: fnCreateFile
    };
}();


