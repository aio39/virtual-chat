import {
  Box,
  ChakraProvider,
  Code,
  Grid,
  Link,
  Text,
  theme,
  VStack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import Stream from './components/Stream';
import Welcome from './components/Welcome';
import { Logo } from './Logo';

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

declare global {
  interface Window {
    myPeerConnection: RTCPeerConnection;
    myDataChannel: RTCDataChannel;
    myStream: MediaStream;
    roomName: string;
  }
}

export const App = () => {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <ColorModeSwitcher justifySelf="flex-end" />
            <VStack spacing={8}>
              <Logo h="40vmin" pointerEvents="none" />
              <Text>
                Edit <Code fontSize="xl">src/App.tsx</Code> and save to reload.
              </Text>
              <Welcome />
              <Stream></Stream>
              <Link
                color="teal.500"
                href="https://chakra-ui.com"
                fontSize="2xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn Chakra
              </Link>
            </VStack>
          </Grid>
        </Box>
      </ChakraProvider>
    </RecoilRoot>
  );
};
