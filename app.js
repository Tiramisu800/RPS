// Contract
const contractAddress ="0x6D756bc0471A7EFCa9a80003cA64046854A55660";
const abi = [
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isWinner",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "outcome",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "userChoice",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "compChoice",
				"type": "uint256"
			}
		],
		"name": "GamePlayed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint8",
				"name": "_option",
				"type": "uint8"
			}
		],
		"name": "playgame",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
];

const provider = new ethers.providers.Web3Provider(window.ethereum, 97);

let signer;
let contract;

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then((accounts)=>{
        signer = provider.getSigner(accounts[0])
        contract = new ethers.Contract(contractAddress, abi, signer);
    });
});


//from html page
let userScore = 0;
let compScore = 0;

const userScore_span = document.getElementById('user-score');
const compScore_span = document.getElementById('comp-score');
const result_p = document.querySelector('.result > p');

const rock_div = document.getElementById('r');
const paper_div = document.getElementById('p');
const scissors_div = document.getElementById('s');

const history = document.getElementById("history");


function convertToWord(n){
    if(n === 0){ return 'Rock'}
    if(n === 1){ return 'Paper'}
    if(n === 2){return 'Scissors'}
    else{return "Computer's choice"}

}

function updateScore() {
    userScore_span.innerHTML = userScore;
    compScore_span.innerHTML = compScore;
}


function win(userChoice, compChoice){
    userScore++;
    result_p.innerHTML = convertToWord(userChoice) + ' beats ' + convertToWord(compChoice) + ". You win!";
    updateScore();
}

function lose(userChoice, compChoice){
    compScore++;
    result_p.innerHTML = convertToWord(userChoice) + ' loses to ' + convertToWord(compChoice) + ". You lost...";
    updateScore();
}

function draw(userChoice, compChoice){
    result_p.innerHTML = convertToWord(userChoice) + ' equals to ' + convertToWord(compChoice) + ". It's a draw!";
    updateScore();
}



// THE GAME 
async function game(userChoice){

    const bet = document.getElementById('bet').value;

    const value = ethers.utils.parseEther(bet);

    // Unscribe, why not work((((
    await contract.off("GamePlayed");
    userScore_span.removeEventListener('DOMSubtreeModified', updateScore);
    compScore_span.removeEventListener('DOMSubtreeModified', updateScore);

    // Subscribe
    const eventName = "GamePlayed";
    await contract.on(eventName, (player, isWinner, outcome, userChoice, compChoice, event) => {
        console.log(`Player: ${player}, Winner: ${isWinner}, Outcome: ${outcome}`);
        const compChoiceInt = parseInt(compChoice.toString());
        if(outcome === "TIE"){draw(userChoice, compChoiceInt)}
        else if(outcome === "WIN"){win(userChoice, compChoiceInt)}
        else if(outcome === "LOSE"){lose(userChoice, compChoiceInt)}
    });

    await contract.playgame(userChoice,  { value: value });

}

//History win or lose
async function viewHistory(){
    const eventName = "GamePlayed";
    const filter = contract.filters.GamePlayed();

    const events = await contract.queryFilter(filter);

    events.forEach((event) => {
        const player = event.args.player;
        const isWinner = event.args.isWinner;
        const outcome = event.args.outcome;
        const userChoice = event.args.userChoice;
        const compChoice = parseInt(event.args.compChoice.toString());
        
        history.innerHTML +=  `<br> Player: ${player}, Winner: ${isWinner}, Outcome: ${outcome} <br>Where User choice - ${convertToWord(userChoice)}, Computer choice - ${convertToWord(compChoice)}<br><br>`;
    });
}

function main(){
    rock_div.addEventListener('click', function(){
        game(0);
    })

    paper_div.addEventListener('click', function(){
        game(1);
    })

    scissors_div.addEventListener('click', function(){
        game(2);
    })

}

main();
