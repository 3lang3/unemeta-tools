import {
  Center,
  Container,
  Text,
  Button,
  Heading,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <Container
      minH="calc(100vh - 76px)"
      w="full"
      maxW="full"
      bgImg={'url("/hero.webp")'}
      bgRepeat="no-repeat"
      bgPos={'center'}
      bgSize="cover"
      display={'flex'}
      alignItems="center"
      justifyContent={'center'}
    >
      <Center bg="whiteAlpha.800" p={32} borderRadius="3xl">
        <VStack spacing={10}>
          <Heading>UneMeta 内部工具集</Heading>
          <Text maxW="560px" textAlign={'center'}>
            All in One Japanese Culture Rooted NFT Marketplace. 🌊
          </Text>
          <HStack spacing={5}>
            <Link to="/dev-mint">
              <Button
                size="lg"
                w="156px"
                borderRadius="4px"
                variant={'outline'}
                colorScheme="black"
              >
                Dev Mint
              </Button>
            </Link>
            <Link to="/mint-list">
              <Button
                size="lg"
                w="156px"
                borderRadius="4px"
                variant={'outline'}
                colorScheme="black"
              >
                内部挂单
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Center>
    </Container>
  );
}
