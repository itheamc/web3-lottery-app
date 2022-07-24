import React, { useReducer, useCallback, useEffect } from 'react'
import Web3 from 'web3/dist/web3.min.js';
import Web3Context from './Web3Context'

// Initial state
const initialState = {
    web3: null,
    artifact: null,
    contract: null,
    accounts: null,
    selectedAccount: null,
    networkId: null,
    error: null,
    connected: false,
    initialized: false,
}


// Reducer function for the state
const reducer = (state, action) => {
    const { type, payload } = action
    switch (type) {
        case 'WEB3_INITIALIZED':
            return {
                ...state,
                ...payload,
            }
        case 'UPDATE_STATE':
            return {
                ...state,
                ...payload,
            }
        default:
            return state
    }
}


// Web3Provider component
const Web3Provider = ({ children }) => {

    // State management
    const [state, dispatch] = useReducer(reducer, initialState)

    // Function to initialize the web3
    const initWeb3 = useCallback(async (artifact) => {
        try {
            if (window.ethereum) {
                const web3 = new Web3(Web3.givenProvider || window.ethereum);
                const { abi, networks } = artifact;
                const networkId = await web3.eth.net.getId();
                let contract_address = networks[networkId].address;
                let contract = new web3.eth.Contract(abi, contract_address);
                let initialized = true;
                dispatch({
                    type: 'WEB3_INITIALIZED',
                    payload: {
                        web3,
                        artifact,
                        contract,
                        networkId,
                        initialized,
                        error: null,
                        connected: web3.eth.currentProvider.selectedAddress !== undefined,
                        selectedAccount: web3.eth.currentProvider.selectedAddress,
                    }
                });
            } else {
                throw new Error('Please install MetaMask first.')
            }
        } catch (error) {
            dispatch({
                type: 'UPDATE_STATE',
                payload: {
                    error,
                }
            });
        }
    }, []);


    // initialize the web3
    useEffect(() => {
        const tryInitWeb3 = () => {
            try {
                const artifact = require('../build/Lottery.json');
                initWeb3(artifact);
            } catch (error) {
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: {
                        error,
                    }
                });
            }
        }
        tryInitWeb3();
    }, [initWeb3]);


    // Add event listeners to the web3
    useEffect(() => {
        if (window.ethereum) {
            const listener = async () => {
                initWeb3(state.artifact);
            }

            const events = ['accountsChanged', 'chainChanged'];
            events.forEach(event => {
                window.ethereum.on(event, listener);
            });
            return () => {
                events.forEach(event => {
                    window.ethereum.removeListener(event, listener);
                });
            }
        }

    }, [initWeb3, state.artifact]);

    return (
        <Web3Context.Provider value={{ state, dispatch }}>
            {children}
        </Web3Context.Provider>
    )
}

export default Web3Provider