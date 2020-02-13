module.exports = {
  primitive: String,
  null_or_non_empty_trimmed_string: true,
  validate: [ ( text ) => {
    if ( text && typeof text === "string" ) {
      return true;
    } else if ( text === null ) {
      return true;
    }
    return false;
  } ]
}