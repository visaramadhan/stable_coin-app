import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../truffle/client/src/abis/SecureStablecoin.json"; // Pastikan path ini sesuai dengan struktur proyekmu

const contractAddress = "0x1Bac2eAf5de076f3C7487BbF12A19a332C50e678"; // ganti dengan alamat kontrak di Ganache

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);

export default function useTransactionLogs(userAddress) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!userAddress) return;

    async function fetchEvents() {
      try {
        // Filter event Transfer (ubah nama event sesuai kontrakmu)
        const filterFrom = contract.filters.Transfer(userAddress, null);
        const filterTo = contract.filters.Transfer(null, userAddress);

        const eventsFrom = await contract.queryFilter(filterFrom);
        const eventsTo = await contract.queryFilter(filterTo);

        const allEvents = [...eventsFrom, ...eventsTo].sort(
          (a, b) => b.blockNumber - a.blockNumber
        );

        const txs = allEvents.map((event) => ({
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          amount: ethers.utils.formatEther(event.args.value),
          blockNumber: event.blockNumber,
        }));

        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching events:", error);
        setTransactions([]);
      }
    }

    fetchEvents();
  }, [userAddress]);

  return transactions;
}
