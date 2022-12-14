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
  Select,
  SimpleGrid,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import Papa from 'papaparse';
import * as ethers from 'ethers';
import erc1155Json from '@/assets/erc1155.json';
import erc721Json from '@/assets/erc721.json';
import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AiOutlineCloudUpload,
  AiOutlineFileText,
  AiOutlineQuestionCircle,
} from 'react-icons/ai';
import { FaEthereum } from 'react-icons/fa';
import { BiKey, BiDetail } from 'react-icons/bi';
import {
  RiErrorWarningFill,
  RiAlarmWarningFill,
  RiCheckboxCircleFill,
} from 'react-icons/ri';
import { AiOutlineApi } from 'react-icons/ai';
import {
  addressesByNetwork,
  generateMakerOrderTypedData,
  MakerOrder,
} from '@unemeta/sdk';
import { ALCHEMY_KEYS, UNEMETA_API_KEY } from '@/constant';
import { getErrorMessage } from '@/utils/error';

const MAKE_MINT_ORDER_API = '/market/v1/mint/make';

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
  contractType: 'ERC721' | 'ERC1155';
  privateKey: string;
  nfts: [string][];
  chainId: 'goerli' | 'homestead';
  strategy: string;
  currency: string;
  price: string;
  api: string;
};

export default function App() {
  const modalRef = useRef<TaskModalAction>(null);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormDataType>({
    defaultValues: {
      chainId: 'homestead',
      contractAddress: '',
      contractType: 'ERC721',
      privateKey: '',
      price: '',
      strategy: '',
      currency: '',
      api: '',
    },
  });

  const onSubmit = handleSubmit((data) => {
    modalRef.current?.open(data);
  });

  return (
    <Container
      pt="20px"
      minH="calc(100vh - 76px)"
      bgColor="#9DC4FB"
      maxW="full"
      centerContent
      overflow="hidden"
    >
      <Box
        overflow={'hidden'}
        pos="relative"
        bg="white"
        borderRadius="lg"
        p={10}
        w="full"
        maxW="1080px"
      >
        <form style={{ width: '100%' }} onSubmit={onSubmit}>
          <Box color="#0B0E3F">
            <VStack w="full" spacing={5}>
              <Box w="full">
                <Heading fontSize={'26px'}>Mint???????????????</Heading>
              </Box>
              <SimpleGrid spacing={5} w="full" templateColumns={'1fr 1fr 1fr'}>
                <FormControl isInvalid={!!errors.contractAddress}>
                  <FormLabel>????????????</FormLabel>
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
                  <FormErrorMessage>?????????????????????</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.contractAddress}>
                  <FormLabel>Strategy????????????</FormLabel>
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
                      name="strategy"
                      rules={{ required: true }}
                      control={control}
                      render={({ field }) => <Input pl={10} {...field} />}
                    />
                  </InputGroup>
                  <FormErrorMessage>?????????Strategy????????????</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.contractAddress}>
                  <FormLabel>Currency????????????</FormLabel>
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
                      name="currency"
                      rules={{ required: true }}
                      control={control}
                      render={({ field }) => <Input pl={10} {...field} />}
                    />
                  </InputGroup>
                  <FormErrorMessage>?????????Currency????????????</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>????????????</FormLabel>

                  <Controller
                    name="price"
                    rules={{ required: true }}
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputGroup borderColor="#E0E1E7">
                          <InputLeftElement
                            pointerEvents="none"
                            children={
                              <Icon
                                fontSize={'18px'}
                                as={FaEthereum}
                                color="gray.800"
                              />
                            }
                          />
                          <Input pl={10} {...field} />
                          <InputRightAddon children="ETH" />
                        </InputGroup>
                      </>
                    )}
                  />

                  <FormErrorMessage>?????????????????????</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.privateKey}>
                  <FormLabel display={'flex'} alignItems="center">
                    ????????????
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
                          ????????????????????????????????????????????????????????????????????????
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

                  <FormErrorMessage>?????????????????????</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.contractType}>
                  <FormLabel>??????Standard</FormLabel>

                  <Controller
                    name="contractType"
                    control={control}
                    render={({ field }) => (
                      <Select borderColor="#E0E1E7" {...field}>
                        <option value={'ERC721'}>ERC-721</option>
                        <option value={'ERC1155'}>ERC-1155</option>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormControl isInvalid={!!errors.chainId}>
                  <FormLabel>????????????</FormLabel>

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
                <FormControl isInvalid={!!errors.api}>
                  <FormLabel>API??????</FormLabel>
                  <Controller
                    name="api"
                    rules={{ required: true }}
                    control={control}
                    render={({ field }) => (
                      <>
                        <InputGroup borderColor="#E0E1E7">
                          <InputLeftElement
                            pointerEvents="none"
                            children={
                              <Icon
                                fontSize={'18px'}
                                as={AiOutlineApi}
                                color="gray.800"
                              />
                            }
                          />
                          <Input pl={10} {...field} />
                        </InputGroup>
                      </>
                    )}
                  />

                  <FormErrorMessage>?????????API??????</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              <FormControl isInvalid={!!errors.nfts}>
                <FormLabel display={'flex'} justifyContent="space-between">
                  NFT????????????
                  <Link
                    href="/template/template_nfts.csv"
                    download
                    target={'_blank'}
                    fontSize={'sm'}
                    color="blue.500"
                  >
                    [download template]
                  </Link>
                </FormLabel>
                <Controller
                  name="nfts"
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
                            <Icon fontSize={'28px'} as={AiOutlineCloudUpload} />
                            <Text fontSize={'sm'}>Upload NFT List</Text>
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
                          Papa.parse<[string]>(file!, {
                            complete: (results) => {
                              const data = results.data.filter((el) => !!el[0]);
                              setValue('nfts', data);
                            },
                          });
                        }}
                      />
                    </Center>
                  )}
                />
                <FormErrorMessage whiteSpace={'break-spaces'}>
                  {errors.nfts?.type === 'required' && <>?????????NFT????????????!</>}
                  <>{errors.nfts?.message}</>
                </FormErrorMessage>
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
                  ????????????
                </Button>
              </FormControl>
            </VStack>
          </Box>
        </form>
      </Box>
      <TaskModal ref={modalRef} />
    </Container>
  );
}

type TaskModalAction = {
  open: (data: FormDataType) => void;
};

const TaskModal = forwardRef<TaskModalAction, any>((_, ref) => {
  const [status, setStatus] = useState<'done' | 'pending' | ''>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const failedTasks = useRef<string[]>([]);
  const [logInfo, setLogInfo] = useState<ReactNode>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [data, setData] = useState<FormDataType>({} as any);
  const toast = useToast({ position: 'bottom-right' });

  const closeModal = () => {
    resetTaskInfo();
    setStatus('');
    onClose();
  };

  const resetTaskInfo = () => {
    setSuccessCount(0);
    setFailedCount(0);
    failedTasks.current = [];
  };

  const start = async () => {
    resetTaskInfo();
    setStatus('pending');

    const chainIdNumber = data.chainId === 'homestead' ? 1 : 5;
    const addresses = addressesByNetwork[chainIdNumber];
    const prd = new ethers.providers.AlchemyProvider(
      data.chainId,
      ALCHEMY_KEYS[data.chainId],
    );

    // ??????signer
    let signer: ethers.ethers.Wallet;
    try {
      signer = new ethers.Wallet(data.privateKey, prd);
    } catch (error: any) {
      setStatus('');
      toast({ title: error?.message, status: 'error' });
      return;
    }

    // ????????????
    try {
      setLogInfo(<Text>???????????????...</Text>);
      const approvalContract = new ethers.Contract(
        data.contractAddress,
        data.contractType === 'ERC721' ? erc721Json.abi : erc1155Json.abi,
        signer!,
      );

      const approvalTargetAddress =
        data.contractType === 'ERC721'
          ? addresses.TRANSFER_MANAGER_ERC721
          : addresses.TRANSFER_MANAGER_ERC1155;

      const approvalTx: ethers.ContractTransaction =
        await approvalContract.setApprovalForAll?.(approvalTargetAddress, true);
      setLogInfo(<Text>??????????????????????????????????????????...</Text>);
      await approvalTx.wait();
    } catch (error: any) {
      toast({
        title: `??????????????????`,
        description: error.message,
        status: 'error',
      });
      setStatus('');
      return;
    }

    // nft??????
    const signerAddress = await signer.getAddress();
    const now = Math.floor(Date.now() / 1000);

    for (const [id] of data.nfts) {
      try {
        setLogInfo(<Text>NFT TokenId: {id} ?????????...</Text>);
        await makeOrder(id);
        setSuccessCount((prev) => prev + 1);
        toast({ title: `NFT TokenId: ${id} ????????????`, status: 'success' });
      } catch (error: any) {
        failedTasks.current.push(id);
        setFailedCount((prev) => prev + 1);
        toast({
          title: `NFT TokenId: ${id} ????????????`,
          description: getErrorMessage(error.message) || '????????????',
          status: 'error',
        });
      }
    }

    setStatus('done');

    async function makeOrder(tokenId: string) {
      const makerOrder: MakerOrder = {
        isOrderAsk: true,
        signer: signerAddress,
        collection: data.contractAddress, // collection contract address
        price: ethers.utils.parseEther(data.price).toString(), // Warning: PRICE IS ALWAYS IN WEI
        tokenId, // Token id is 0 if you use the STRATEGY_COLLECTION_SALE strategy
        amount: 1, // Warning: amount is int
        strategy: data.strategy || addresses.STRATEGY_STANDARD_SALE,
        currency: data.currency || addresses.WETH,
        nonce: Math.floor(Date.now() / 1000),
        startTime: now,
        endTime: now + 86400 * 30, // 30 day validity
        minPercentageToAsk: 8500,
        params: [],
      };
      const { domain, value, type } = generateMakerOrderTypedData(
        signerAddress,
        chainIdNumber,
        makerOrder,
      );
      const signature = await signer._signTypedData(domain, type, value);

      const makeResp = await fetch(`${data.api}${MAKE_MINT_ORDER_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-api-key': UNEMETA_API_KEY,
        },
        body: JSON.stringify({ order: { ...makerOrder, sign: signature } }),
      });
      const json = await makeResp.json();
      if (!json.data.status) {
        throw Error('??????????????????????????????????????????');
      }
    }
  };

  const totalNfts = useMemo(() => data.nfts?.length || 0, [data?.nfts]);

  const taskPercentage =
    +((successCount + failedCount) / totalNfts).toFixed(2) * 100;

  const open = (p: FormDataType) => {
    setData(p);
    onOpen();
  };

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter={'blur(20px)'} />
        <ModalContent>
          <ModalHeader>????????????</ModalHeader>

          {status !== 'pending' && <ModalCloseButton />}

          <ModalBody>
            <VStack spacing={10}>
              <Center w="full" h="100px">
                {(() => {
                  if (status === 'pending')
                    return (
                      <CircularProgress
                        value={59}
                        color="#0D74FF"
                        isIndeterminate
                        size="100px"
                        thickness="6px"
                      >
                        <CircularProgressLabel>
                          {taskPercentage}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    );
                  if (status === 'done')
                    return (
                      <Icon
                        fontSize={'100px'}
                        color={failedCount > 0 ? 'orange.500' : 'green.400'}
                        as={
                          failedCount > 0
                            ? RiAlarmWarningFill
                            : RiCheckboxCircleFill
                        }
                      />
                    );
                  return (
                    <Icon
                      color="red.500"
                      fontSize={'100px'}
                      as={RiErrorWarningFill}
                    />
                  );
                })()}
              </Center>

              {status === 'pending' ? (
                <Flex
                  px={5}
                  py={3}
                  border="1px solid #ddd"
                  borderRadius={'xl'}
                  w="full"
                  align={'center'}
                  justify={'space-between'}
                >
                  <Text color="gray.500">????????????</Text>
                  {logInfo}
                </Flex>
              ) : (
                <Box w="full" bg="gray.50" p={5} borderRadius="xl">
                  <Heading mb="15px" fontSize={'16px'}>
                    ????????????????????????/???????????????
                  </Heading>
                  <List fontSize={'14px'} spacing="10px">
                    <ListItem>1. ???????????????????????????Gas Fee????????????</ListItem>
                    <ListItem>2. ??????????????????????????????????????????</ListItem>
                    <ListItem>3. ???????????????????????????</ListItem>
                  </List>
                </Box>
              )}
            </VStack>
            {failedCount > 0 && (
              <Flex
                justify={'space-between'}
                bg="red.50"
                p={3}
                borderRadius="lg"
                mt={5}
              >
                <Text fontSize={'sm'}>
                  ?????????????????????????????????????????????????????????
                </Text>
                <Button
                  textDecoration={'underline'}
                  fontSize={'sm'}
                  color="#0D74FF"
                  variant={'link'}
                  isLoading={status !== 'done'}
                  loadingText="??????????????????"
                  _hover={{}}
                  onClick={() => {
                    downloadCSV(failedTasks.current);
                    closeModal();
                  }}
                >
                  [????????????]
                </Button>
              </Flex>
            )}
          </ModalBody>

          <ModalFooter
            borderTop={'1px solid'}
            borderColor="blackAlpha.100"
            mt={5}
          >
            <Button
              w="full"
              size="lg"
              isLoading={status === 'pending'}
              loadingText="?????????????????????????????????"
              bg="#0D74FF"
              color="white"
              _hover={{}}
              onClick={status === 'done' ? closeModal : start}
            >
              {status === 'done' ? '????????????' : '????????????'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});
