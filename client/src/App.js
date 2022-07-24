import { useCallback } from 'react';
import './App.css';
import useWeb3 from './contracts/provider/useWeb3';

function App() {

  const { state: { web3, connected, selectedAccount, accounts }, dispatch } = useWeb3();

  // callback hook to request the user to connect to their wallet
  const tryConnect = useCallback(
    async () => {
      try {
        const accounts_lst = await web3.eth.requestAccounts();
        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            accounts: accounts_lst,
            selectedAccount: accounts_lst[0],
            connected: true,
          }
        });
      } catch (error) {
        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            error,
          }
        });
      }
    }, [dispatch, web3]);

  // Function to initiate the callback hook
  const requestWalletConnect = async () => {
    await tryConnect();
  }

  // Function to disconnect the user from their wallet
  const disconnect = async () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        connected: false,
        selectedAccount: null,
        accounts: null,
      }
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{connected ? 'Connected' : 'Disconnected'}</h1>
        {selectedAccount && <h2>{selectedAccount.substring(0, 7) + '...' + selectedAccount.substring(selectedAccount.length - 7)}</h2>}
        {(connected && accounts) && accounts.length > 0 && <ol>{accounts.map((a) => <li key={a}>{a}</li>)}</ol>}
        <button onClick={connected ? disconnect : requestWalletConnect}>{connected ? 'Disconnect' : 'Connect'}</button>
      </header>
    </div>
  );
}

export default App;
