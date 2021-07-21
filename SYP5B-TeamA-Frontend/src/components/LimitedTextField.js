import React from "react";
import { TextField } from "@material-ui/core";

export default function LimitedTextField(props) {
    const { limit, initialValue } = props
  const [values, setValues] = React.useState({
    name: initialValue
  });

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  return (
      <TextField
        inputProps={{
          maxlength: limit
        }}
        value={values.name}
        helperText={`${values.name.length}/${limit}`}
        onChange={handleChange("name")}
        {...props}
      />
  );
}
