import Web3 from "web3";
import SecureStablecoin from "../contracts/SecureStablecoin.json";

const getContractInstance = async () => {
  const web3 = new Web3(window.ethereum);
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = SecureStablecoin.networks[networkId];

  const instance = new web3.eth.Contract(
    SecureStablecoin.abi,
    deployedNetwork && deployedNetwork.address
  );

  const accounts = await web3.eth.requestAccounts();

  return { instance, web3, accounts };
};

export default getContractInstance;
