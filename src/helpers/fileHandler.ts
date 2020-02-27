const fs = require('fs');
const hash = require('object-hash');

export const storeData = (path : string, data : any , isJson : boolean) => {
  try {
    if ( isJson ) {
      const json_data = JSON.stringify(data, null, 2);
      fs.writeFileSync(path, json_data);
    } else {
      fs.writeFileSync(path, data);
    }
  } catch (err) {
    console.error(err);
  }
}

export const loadData = (path : string, isJson : boolean) => {
  try {
    const data = fs.readFileSync(path, 'utf8');
    if ( isJson ) {
      return JSON.parse( data );
    } else {
      return data;
    }
  } catch (err) {
    console.error(err)
    return false
  }
}

export const saveIfChanged = (filePath : string, toWrite : any, isJson : boolean = false) => {
  if (!fs.existsSync(filePath) ) {
    // file doesn't exist, so write it
    storeData( filePath, toWrite, isJson );
  } else {
    const loadedData = loadData( filePath, isJson );
    if ( loadedData ) {
      if ( hash(loadedData) !== hash(toWrite) ) {
        storeData( filePath, toWrite, isJson );
      }
    } else {
      storeData( filePath, toWrite, isJson );
    }
  }
}