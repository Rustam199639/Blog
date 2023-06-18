import React, { useEffect } from 'react';
import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'

function PasswordInput(props) {
    const [show, setShow] = React.useState(false)

    const handleClick = () => {
      setShow(!show);
    }
    const handleChange = (event) => {
      if (event.target.value !== undefined) {
        props.setPass(event.target.value)
      }
    }
    return (
      
      <InputGroup size='md'>
        <Input
          pr='4.5rem'
          type={show ? 'text' : 'password'}
          placeholder='Password'
          onChange={handleChange}
        />
        <InputRightElement width='4.5rem'>
          <Button h='1.75rem' size='sm' onClick={handleClick}>
            {show ? 'Hide' : 'Show'}
          </Button>
        </InputRightElement>
      </InputGroup>
    )
  }
  export default PasswordInput