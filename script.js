const contractAddress = "0xFDed811E10d2512b5D2Fb190Be4D565E44C685F1";  // Replace with deployed contract address
const contractABI =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ProductRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "registerProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "productCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "productId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_productId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "verifyProduct",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];  // Replace with your contract ABI

let web3 = new Web3(window.ethereum);
let contract = new web3.eth.Contract(contractABI, contractAddress);

// 🟢 Register Product Function
async function registerProduct() {
    const name = document.getElementById("productNameInput").value;
    const ipfsHash = document.getElementById("ipfsHashInput").value;

    if (!name || !ipfsHash) {
        alert("Please enter all details!");
        return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const sender = accounts[0];

    try {
        await contract.methods.registerProduct(name, ipfsHash).send({ from: sender });
        alert("✅ Product Registered Successfully!");
    } catch (error) {
        console.error("❌ Error Registering Product:", error);
        alert("Error: " + error.message);
    }
}

// 🟢 Verify Product Function (Using Product ID)
async function verifyProduct() {
    const productId = document.getElementById("productId").value;
    
    if (!productId) {
        alert("Please enter a Product ID");
        return;
    }

    try {
        const product = await contract.methods.products(productId).call();
        if (!product.name) {
            alert("❌ Product Not Found!");
            return;
        }

        document.getElementById("productName").innerText = product.name;
        document.getElementById("ipfsHash").innerText = product.ipfsHash;
        document.getElementById("owner").innerText = product.owner;

        alert("✅ Product Verified!");
    } catch (error) {
        console.error("❌ Verification Error:", error);
        alert("Error: " + error.message);
    }
}

// 🟢 Scan QR Code & Extract IPFS Hash
function startScanner() {
    let scanner = new Html5Qrcode("reader");
    
    scanner.start(
        { facingMode: "environment" },  // Rear camera
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            console.log("✅ Scanned QR Code:", decodedText);
            
            if (decodedText.includes("ipfs/")) {
                const ipfsHash = decodedText.split("/").pop();
                findProductByIPFS(ipfsHash);
            } else {
                alert("❌ Invalid QR Code Format");
            }
        },
        (errorMessage) => { console.warn(errorMessage); }
    );
}

// 🟢 Find Product by IPFS Hash (After Scanning)
async function findProductByIPFS(ipfsHash) {
    try {
        const totalProducts = await contract.methods.productCount().call();
        
        for (let i = 1; i <= totalProducts; i++) {
            const product = await contract.methods.products(i).call();
            if (product.ipfsHash === ipfsHash) {
                document.getElementById("productName").innerText = product.name;
                document.getElementById("ipfsHash").innerText = product.ipfsHash;
                document.getElementById("owner").innerText = product.owner;
                alert("✅ Product Verified via QR Code!");
                return;
            }
        }
        
        alert("❌ No Product Found for this QR Code!");
    } catch (error) {
        console.error("❌ Error Finding Product by IPFS:", error);
        alert("Error: " + error.message);
    }
}
