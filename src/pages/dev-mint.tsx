import {
  Container,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  Center,
  Icon,
  Link,
  Tooltip,
  useDisclosure,
  useToast,
  List,
  ListItem,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import Papa from 'papaparse';
import * as ethers from 'ethers';
import { useMemo, useRef, useState } from 'react';
import {
  AiOutlineCloudUpload,
  AiOutlineFileText,
  AiOutlineQuestionCircle,
} from 'react-icons/ai';
import { FaEthereum } from 'react-icons/fa';
import { BiDetail, BiKey } from 'react-icons/bi';
import { MdSettingsEthernet } from 'react-icons/md';
import { GiGearHammer } from 'react-icons/gi';
import { ALCHEMY_KEYS } from '@/constant';
import { ETH_WALLET_ADDRESS_REG } from '@/reg';

function downloadCSV(arr: string[]) {
  const obj = arr.reduce<Record<string, number>>((a, v) => {
    a[v] = a[v] ? a[v] + 1 : 1;
    return a;
  }, {});
  const data = Object.entries(obj).map(([k, v]) => [k, v.toString()]);

  const csv = Papa.unparse(data);

  const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const csvURL = window.URL.createObjectURL(csvData);

  const tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', 'mint_failed_list.csv');
  tempLink.click();
}

type FormDataType = {
  contractAddress: string;
  privateKey: string;
  abi: Record<string, unknown>[];
  addresses: [string, string][];
  chainId: 'goerli' | 'homestead';
};

export default function App() {
  const toast = useToast();
  const [status, setStatus] = useState<'done' | 'pending' | ''>('');
  const contractRef = useRef<ethers.ethers.Contract>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const failedTasks = useRef<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const {
    watch,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormDataType>({
    defaultValues: {
      chainId: 'homestead',
      contractAddress: '',
      privateKey: '',
    },
  });
  const formValues = watch();

  const usersCount = useMemo(
    () => formValues.addresses?.length,
    [formValues.addresses],
  );

  const mintTotalCount = useMemo(
    () =>
      formValues.addresses?.reduce((a, v) => {
        a += +v[1];
        return a;
      }, 0),
    [formValues.addresses],
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      const prd = new ethers.providers.AlchemyProvider(
        data.chainId,
        ALCHEMY_KEYS[data.chainId],
      );
      const signer = new ethers.Wallet(data.privateKey, prd);
      contractRef.current = new ethers.Contract(
        data.contractAddress,
        data.abi,
        signer,
      );
      onOpen();
    } catch (error: any) {
      toast({ title: error?.message, status: 'error' });
    }
  });

  const closeModal = () => {
    resetTaskInfo();
    onClose();
  };

  const resetTaskInfo = () => {
    setSuccessCount(0);
    setFailedCount(0);
    setStatus('');
    failedTasks.current = [];
  };

  const start = async () => {
    resetTaskInfo();
    setStatus('pending');

    for (const [address, count] of formValues.addresses) {
      for (const _ in Array.from({ length: +count })) {
        try {
          await contractRef.current?.devMint(address, '1');
          setSuccessCount((prev) => prev + 1);
        } catch (error) {
          console.log('🚀 ~ file: App.tsx ~ line 175 ~ start ~ error', error);
          setFailedCount((prev) => prev + 1);
          failedTasks.current.push(address);
        }
      }
    }
    setStatus('done');
  };

  return (
    <Container
      minH="calc(100vh - 76px)"
      bg="#9DC4FB"
      maxW="full"
      mt={0}
      centerContent
      justifyContent={'center'}
      overflow="hidden"
    >
      <Flex>
        <Box
          overflow={'hidden'}
          pos="relative"
          bg="white"
          borderRadius="lg"
          px={20}
          py={14}
        >
          <form onSubmit={onSubmit}>
            <Box color="#0B0E3F">
              <VStack w="420px" spacing={5}>
                <Box w="full">
                  <Heading fontSize={'26px'}>Dev Mint Tool</Heading>
                </Box>
                <FormControl isInvalid={!!errors.contractAddress}>
                  <FormLabel>合约地址</FormLabel>
                  <InputGroup borderColor="#E0E1E7">
                    <InputLeftElement
                      pointerEvents="none"
                      children={
                        <Icon
                          fontSize={'20px'}
                          as={BiDetail}
                          color="gray.800"
                        />
                      }
                    />
                    <Controller
                      name="contractAddress"
                      rules={{ required: true }}
                      control={control}
                      render={({ field }) => <Input pl={10} {...field} />}
                    />
                  </InputGroup>
                  <FormErrorMessage>请输入合约地址</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.abi}>
                  <FormLabel display={'flex'} justifyContent="space-between">
                    合约ABI文件
                    <Link
                      href="/template/template_abi.json"
                      download
                      target={'_blank'}
                      fontSize={'sm'}
                      color="blue.500"
                    >
                      [download template]
                    </Link>
                  </FormLabel>
                  <Controller
                    name="abi"
                    rules={{ required: true }}
                    control={control}
                    render={({ field }) => (
                      <Center pos="relative">
                        <Center
                          w="full"
                          h="80px"
                          border="2px dashed"
                          borderColor={'gray.200'}
                          borderRadius={'lg'}
                          bg={field.value ? 'gray.100' : 'transparent'}
                        >
                          {field.value ? (
                            <HStack color="black">
                              <Icon fontSize={'30px'} as={MdSettingsEthernet} />
                              <Text>Contract abi get success!</Text>
                            </HStack>
                          ) : (
                            <HStack spacing={1} color="blackAlpha.400">
                              <Icon fontSize={'26px'} as={FaEthereum} />
                              <Text fontSize={'sm'}>Upload Contract Abi</Text>
                            </HStack>
                          )}
                        </Center>
                        <Input
                          h="full"
                          type="file"
                          accept=".json"
                          pos="absolute"
                          top="0"
                          bottom="0"
                          left="0"
                          right="0"
                          opacity={0}
                          onChange={(e) => {
                            const file = e.target?.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              setValue(
                                'abi',
                                JSON.parse(reader.result as string),
                              );
                            };
                            reader.readAsText(file!);
                          }}
                        />
                      </Center>
                    )}
                  />
                  <FormErrorMessage>请上传合约ABI文件</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.privateKey}>
                  <FormLabel display={'flex'} alignItems="center">
                    钱包私钥
                    <Tooltip
                      hasArrow
                      placement="top"
                      padding={4}
                      rounded="lg"
                      bg="black"
                      color="white"
                      textAlign={'center'}
                      offset={[0, 15]}
                      label={
                        <Text>
                          确保没有其他人看到或能够捕获检索私钥时的屏幕截图
                        </Text>
                      }
                    >
                      <Text
                        ml="5px"
                        display={'inline-flex'}
                        alignItems="center"
                      >
                        <AiOutlineQuestionCircle />
                      </Text>
                    </Tooltip>
                  </FormLabel>
                  <InputGroup borderColor="#E0E1E7">
                    <InputLeftElement
                      pointerEvents="none"
                      children={
                        <Icon fontSize={'20px'} as={BiKey} color="gray.800" />
                      }
                    />
                    <Controller
                      rules={{ required: true }}
                      name="privateKey"
                      control={control}
                      render={({ field }) => (
                        <Input type="password" pl={10} {...field} />
                      )}
                    />
                  </InputGroup>

                  <FormErrorMessage>请输入钱包私钥</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.addresses}>
                  <FormLabel display={'flex'} justifyContent="space-between">
                    用户列表文件
                    <Link
                      href="/template/template_users.csv"
                      download
                      target={'_blank'}
                      fontSize={'sm'}
                      color="blue.500"
                    >
                      [download template]
                    </Link>
                  </FormLabel>
                  <Controller
                    name="addresses"
                    rules={{ required: true }}
                    control={control}
                    render={({ field }) => (
                      <Center pos="relative">
                        <Center
                          w="full"
                          h="80px"
                          border="2px dashed"
                          borderColor={'gray.200'}
                          borderRadius={'lg'}
                          bg={field.value ? 'gray.100' : 'transparent'}
                        >
                          {field.value ? (
                            <HStack color="black">
                              <Icon fontSize={'28px'} as={AiOutlineFileText} />
                              <Text>
                                Upload success!
                                <strong>(rows: {field.value.length})</strong>
                              </Text>
                            </HStack>
                          ) : (
                            <VStack spacing={1} color="blackAlpha.400">
                              <Icon
                                fontSize={'28px'}
                                as={AiOutlineCloudUpload}
                              />
                              <Text fontSize={'sm'}>Upload User List</Text>
                            </VStack>
                          )}
                        </Center>
                        <Input
                          cursor={'pointer'}
                          type="file"
                          accept=".csv"
                          pos="absolute"
                          zIndex={2}
                          h="full"
                          top="0"
                          bottom="0"
                          left="0"
                          right="0"
                          opacity={0}
                          onChange={(e) => {
                            const file = e.target?.files?.[0];
                            if (!file) return;
                            Papa.parse<[string, string]>(file!, {
                              complete: (results) => {
                                const data = results.data.filter(
                                  (el) => !!el[0] && !!el[1],
                                );
                                const errorAddrs = data.filter(
                                  ([r]) => !ETH_WALLET_ADDRESS_REG.test(r),
                                );
                                if (errorAddrs.length) {
                                  setError('addresses', {
                                    message: `❌ 发现以下错误地址:\n${errorAddrs
                                      .map((el) => el[0])
                                      .join('\n')}`,
                                  });
                                  return;
                                }
                                setValue('addresses', data);
                              },
                            });
                          }}
                        />
                      </Center>
                    )}
                  />
                  <FormErrorMessage whiteSpace={'break-spaces'}>
                    {errors.addresses?.type === 'required' && (
                      <>请上传用户列表文件!</>
                    )}
                    <>{errors.addresses?.message}</>
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.chainId}>
                  <FormLabel>选择网络</FormLabel>

                  <Controller
                    name="chainId"
                    control={control}
                    render={({ field }) => (
                      <Select borderColor="#E0E1E7" {...field}>
                        <option value="goerli">Goerli</option>
                        <option value="homestead">Mainnet</option>
                      </Select>
                    )}
                  />
                </FormControl>

                <FormControl id="name" float="right">
                  <Button
                    type="submit"
                    variant="solid"
                    bg="#0D74FF"
                    color="white"
                    _hover={{}}
                    w="full"
                    size="lg"
                  >
                    提交任务
                  </Button>
                </FormControl>
              </VStack>
            </Box>
          </form>

          {isOpen && (
            <Box zIndex={3} pos="absolute" inset="0" bg="white" px={20} py={14}>
              <Heading mb={5} fontSize={'26px'}>
                Mint详情
              </Heading>
              <VStack spacing={10}>
                <Center w="80px" h="80px">
                  {status === 'pending' ? (
                    <Spinner
                      color="#0D74FF"
                      emptyColor="gray.200"
                      size="xl"
                      thickness="4px"
                      speed="0.65s"
                    />
                  ) : (
                    <Icon color="red.500" fontSize={'72px'} as={GiGearHammer} />
                  )}
                </Center>

                <VStack
                  spacing={5}
                  p={5}
                  border="1px solid #ddd"
                  borderRadius={'xl'}
                  w="full"
                >
                  {status === 'done' || status === 'pending' && (
                    <Flex w="full" align={'center'} justify={'space-between'}>
                      <Text color="gray.500">Mint成功/失败</Text>{' '}
                      <Text fontWeight={'bold'}>
                        <Text color="green.400" as="strong">
                          {successCount || 0}
                        </Text>
                        /
                        <Text color="red.400" as="strong">
                          {failedCount || 0}
                        </Text>
                      </Text>
                    </Flex>
                  )}

                  <Flex w="full" align={'center'} justify={'space-between'}>
                    <Text color="gray.500">需Mint总数/参与用户数</Text>
                    <Text fontWeight={'bold'} color="black">
                      {mintTotalCount}/{usersCount}
                    </Text>
                  </Flex>
                </VStack>

                <Box w="full" bg="gray.50" p={5} borderRadius="xl">
                  <Heading mb="15px" fontSize={'16px'}>
                    Mint有可能（全部/部分）失败
                  </Heading>
                  <List fontSize={'14px'} spacing="10px">
                    <ListItem>
                      1. 账户余额不足以支付Gas Fee导致mint失败
                    </ListItem>
                    <ListItem>2. 以太网网路堵塞问题，导致mint失败</ListItem>
                    <ListItem>3. 未知问题，导致mint失败</ListItem>
                  </List>
                </Box>
              </VStack>

              <VStack mt={10} spacing={5}>
                {status !== 'done' && (
                  <Button
                    isLoading={status === 'pending'}
                    loadingText="任务进行中，请耐心等待"
                    size="lg"
                    w="full"
                    bg="#0D74FF"
                    color="white"
                    _hover={{}}
                    onClick={start}
                  >
                    开始任务
                  </Button>
                )}
                {status === 'done' && failedCount === 0 && (
                  <Button
                    size="lg"
                    w="full"
                    bg="green.400"
                    color="white"
                    _hover={{}}
                    onClick={closeModal}
                  >
                    恭喜！任务完成
                  </Button>
                )}
                {status === 'done' && failedCount > 0 && (
                  <Button
                    size="lg"
                    w="full"
                    bg="orange.400"
                    color="white"
                    _hover={{}}
                    onClick={() => {
                      downloadCSV(failedTasks.current);
                      closeModal();
                    }}
                  >
                    部分Mint失败，点击下载此csv文件
                  </Button>
                )}
                {status !== 'pending' && (
                  <Button w="full" size="lg" mr={3} onClick={closeModal}>
                    关闭
                  </Button>
                )}
              </VStack>
            </Box>
          )}
        </Box>
      </Flex>
    </Container>
  );
}
