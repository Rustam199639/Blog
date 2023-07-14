import React from "react";
import { Text, Input } from "@chakra-ui/react";

function LogInComp(props) {
  const handleChange = (event) => {
    if (event.target.value !== undefined) {
      props.onChange(event.target.value);
    }
  };

  return (
   
      <Input
        value={props.login}
        onChange={handleChange}
        placeholder="Login"
        size="md"
      />

  );
}
export default LogInComp;