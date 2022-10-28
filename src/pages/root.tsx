import {
  Flex,
  Text,
  HStack,
  Image,
  Link as ChakraLink,
  Badge,
} from '@chakra-ui/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import logo from '@/assets/logo.png'


export default function Root() {
  return (
    <>
      <Flex bg="white" h="76px" align={'center'} px={10}>
        <ChakraLink mr={20} as={Link} textDecoration="none !important" to="/">
          <HStack spacing={5}>
            <Image src={logo} h="auto" w="38px" />
            <HStack>
              <Text fontWeight={'600'} fontSize="lg">
                UneMeta
              </Text>
              <Badge>DEV ONLY</Badge>
            </HStack>
          </HStack>
        </ChakraLink>
        <HStack
          spacing={10}
          textTransform={'capitalize'}
          sx={{
            '& .active': {
              color: 'blue.500',
            },
          }}
        >
          <NavLink to="/dev-mint">dev mint</NavLink>
          <NavLink to="/mint-list">内部挂单</NavLink>
        </HStack>
      </Flex>
      <Outlet />
    </>
  );
}
