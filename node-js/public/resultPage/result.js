window.onload = async () => {
  await getLeaderBoard();
  getScore();
  callLeaderBoard();
  submitScore();
};

let lowestScore = 0;
let isRegistered = false;

async function getLeaderBoard() {
  const resp = await fetch(`/board`);
  const board = await resp.json();
  let htmlStr = `
    <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Score</th>
    </tr>`;
  let writeScore = false;
  for (const i in board) {
    if (board[i].username && i < 10) {
      let rank = parseInt(i) + 1;
      if (score > board[i].score && !writeScore) {
        htmlStr += `
            <tr>
            <td>${rank}</td>
            <td id="your-name"><div class="input-group">
            <input type="text" class="form-control" id="input-name" placeholder="Input Your Name" aria-label="Username" aria-describedby="addon-wrapping">
          </div></td>
            <td>${score}</td>
            </tr>
            `;
        writeScore = true;
      }
      if (writeScore) {
        rank += 1;
      }
      htmlStr += `
                <tr>
                    <td>${rank}</td>
                    <td>${board[i].username}</td>
                    <td>${board[i].score}</td>
                </tr>
                `
      lowestScore = board[i].score;
    }
  };
  document.querySelector("#leader-board").innerHTML = htmlStr;
}

let params = new URLSearchParams(window.location.search);
let score = parseInt(params.get("points"), 10);
let correct = parseInt(params.get("correct"), 10);

// get score from game
function getScore() {
  document.querySelector('#score').innerHTML = score;
  document.querySelector('#correct').innerHTML = `${correct}/15`
}

// call leaderboard up when score is within top ten.
function callLeaderBoard() {
  if (score > lowestScore) {
    document.querySelector('#leaderboard_button').click();
  }
}

// Submit score when pressed enter in 
function submitScore() {
  const inputBox = document.querySelector("#input-name");
  if (inputBox) {
    inputBox.addEventListener('keypress', async function (e) {
      if (e.key === 'Enter') {
        // To disable input after first input to avoid multiple input within short time
        inputBox.replaceWith(inputBox.cloneNode(true));
        // Update database
        const res = await fetch('/board', {
          method: 'POST',
          headers: {
            "Content-Type": 'application/json',
          },
          body: JSON.stringify({
            user: inputBox.value,
            score: score
          })
        });
        const result = await res.json();
        if (result.status) {
          // Confirm the name of player in the leaderboard
          document.querySelector("#your-name").innerHTML = inputBox.value;
          // Show success toast for 5 seconds
          document.querySelector("#successToast").classList.toggle("hide");
          document.querySelector("#successToast").classList.toggle("show");
          setTimeout(()=>{
            document.querySelector("#successToast").classList.toggle("hide");
            document.querySelector("#successToast").classList.toggle("show");
          }, 5000);
        } else {
          // Update the error message in the fail toast
          document.querySelector("#failToast .toast-body").innerHTML = result.msg;
          // Show fail toast for 5 seconds
          document.querySelector("#failToast").classList.toggle("hide");
          document.querySelector("#failToast").classList.toggle("show");
          setTimeout(()=>{
            document.querySelector("#failToast").classList.toggle("hide");
            document.querySelector("#failToast").classList.toggle("show");
          }, 5000);
        }
      }
    });
  }
}