const fs = require('fs');
const hash = require('object-hash');

const storeData = (path, data, isJson) => {
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

const loadData = (path, isJson) => {
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

const saveIfChanged = (filePath, toWrite, isJson) => {
  if (!fs.existsSync(filePath) ) {
    // file doesn't exist, so write it
    storeData( filePath, toWrite, isJson );
  } else {
    const loadedData = loadData( filePath, isJson );
    if ( loadedData ) {
      if ( hash(loadedData) === hash(toWrite) ) {
        // no change
      } else {
        storeData( filePath, toWrite, isJson );
      }
    } else {
      storeData( filePath, toWrite, isJson );
    }
  }
}

module.exports = {
  storeData,
  loadData,
  saveIfChanged,
}