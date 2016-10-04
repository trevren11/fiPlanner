function writeUserData(userId, name, email, imageUrl) {
  // Updates user or makes new one
  firebase.database().ref('users/' + userId).update({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}

function makeUserPortfolio(profileName) {
  if (firebase.auth().currentUser) {
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + "/profiles/" + profileName).update({
      profile: profileName
    });
  } else notSignedIn();
}

function updateGoal(newDate, storageVal) {
  var profileName = storageVal.simulation == null ? 'Retirement' : storageVal.simulation;
  if (firebase.auth().currentUser && newDate != null) {
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + "/profiles/" + profileName).update({
      goalDate: newDate
    });
    console.log(newDate + profileName);
  } else notSignedIn();
}

function calculate() {
  // get expenses, income, current net worth, Returns
  // count
  // calculate percent of expenses covered, new net worth
  console.log("HERE");
  console.log(calculationInfo);
  // console.log(Number(calculationInfo.expenses));
  var desiredNetWorth = parseInt(calculationInfo.desiredNetworth);
  var currentNetWorth = parseInt(calculationInfo.currentNetWorth);
  var income = parseInt(calculationInfo.yearlyIncome);
  var expenses = parseInt(calculationInfo.yearlyExpenses);
  var rateOfReturn = parseInt(calculationInfo.rateOfReturn);
  var currentAge = parseInt(calculationInfo.currentAge);
  var goalDate = new Date(calculationInfo.datepicker);
  console.log(goalDate.toDateString());
  // <div class="progress-bar progress-bar-large " aria-valuenow="40" style="width:40%">
  // calculate percent of goal done
  var percentOfGoal = (currentNetWorth / desiredNetWorth) * 100;
  console.log("PERCENT: " + percentOfGoal);
  $('#percentGoal').attr('aria-valuenow', percentOfGoal).css('width', percentOfGoal + '%');
  var saving = income - expenses;
  var retirementAllowance = (desiredNetWorth * (rateOfReturn / 100)).toFixed(0);
  $('#monthlySavings').html((saving / 12).toFixed(0));
  $('#yearlySavings').html(saving.toFixed(0));
  $('#monthlyRetirementSpending').html((retirementAllowance / 12).toFixed(0));
  $('#yearlyRetirementSpending').html(retirementAllowance);

  $('#display_goalDate').html(goalDate.toDateString());

  // console.log(desiredNetWorth);
  // console.log(currentNetWorth);
  // console.log(income);
  // console.log(expenses);
  // console.log(rateOfReturn);
  var roi = 0; // calculate till when roi is larger than expenses
  var year = 0;
  var yearNotFound = true;
  var yearsTillRetirement = 50;
  while (currentNetWorth < desiredNetWorth) {
    // get currentNetWorth and add currentNetWorth *= rateOfReturn/100
    year++;
    var difference = currentNetWorth;
    roi = currentNetWorth * (rateOfReturn / 100);
    currentNetWorth = income - expenses + currentNetWorth + currentNetWorth * (rateOfReturn / 100);
    difference = currentNetWorth - difference; // this is the total growth
    console.log("Year net worth: " + currentNetWorth.toFixed(0));
    var percentOfExpenses = (roi / expenses) * 100
    if (yearNotFound == true && percentOfExpenses > 100) {
      console.log("inside found")
      yearNotFound = false;
      yearsTillRetirement = year;
      var d = new Date();
      d.setDate(d.getDate() + year * 365);
      $('#projectedRetirementDate').html(d.toDateString());
      $('#yearsTillRetirement').html(year);
      $('#display_retireAge').html(year+currentAge);
    }

    $('#calculations').append(
      '<tr>'
      + '<th>' + year + '</th>'
      + '<th>$' + income + '</th>'
      + '<th>$' + difference.toFixed(0) + '</th>'
      + '<th>$' + expenses + '</th>'
      + '<th>$' + roi.toFixed(0) + '</th>'
      + '<th>' + percentOfExpenses.toFixed(0) + '%</th>'
      + '<th>$' + currentNetWorth.toFixed(0) + '</th>'
      + '</tr>'
    );
  }

}

function loadData() {
  //Get all of the information here and put it to the page
  console.log("Load data");

  if (firebase.auth().currentUser) {
    var profileName = storage.simulation == null ? 'Retirement' : storage.simulation;

    // $('#goalDate').html('');
    var str = 'users/' + firebase.auth().currentUser.uid + '/profiles/' + profileName;
    console.log(str);
    var commentsRef = firebase.database().ref(str);
    commentsRef.on('child_added', function (data) {
      $('#display_' + data.key).html(data.val());
      calculationInfo[data.key] = data.val();
    });

    commentsRef.on('value', function (data) {
      console.log("VALUE");
      calculate();
    });

    // Do math here once it is done loading, might not load right away
  }
  else notSignedIn();
}

function updateProfileData(data) {
  if (firebase.auth().currentUser) {
    var profileName = storage.simulation == null ? 'Retirement' : storage.simulation;
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/profiles/' + profileName).set(data);
  } else notSignedIn();
}

function updateExpenseData(data) {
  if (firebase.auth().currentUser) {
    var profileName = storage.simulation == null ? 'Retirement' : storage.simulation;
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/profiles/' + profileName + '/costs').set(data);
  } else notSignedIn();
}

function notSignedIn() {
  alert("You are not signed in!");
}


function getCosts() {
  //Get all of the information here and put it to the page
  // console.log("Load data");
  storage.yearCount = 0;

  if (firebase.auth().currentUser) {
    var str = 'users/' + firebase.auth().currentUser.uid + '/profiles/' + profileName + '/costs';
    console.log(str);
    var commentsRef = firebase.database().ref(str);
    commentsRef.on('child_added', function (data) {
      // console.log("HERE" + data.key);
      // console.log(data.val().expenses);
      appendCost(data);
    });
  }
  else notSignedIn();
}


function appendCost(data) {
  $('#yearCosts').append(
    '<label class="col-sm-3 control-label text-center" for="costs_year_' + ++storage.yearCount + '">' + storage.yearCount + '</label>'
    + '<div class="col-sm-3" ><input value=' + data.val().income + ' required type="number" class="form-control" id="costs_income_' + storage.yearCount + '" placeholder="60000"/></div>'
    + '<div class="col-sm-3" ><input value=' + data.val().expenses + ' required type="number" class="form-control" id="costs_expenses_' + storage.yearCount + '" placeholder="30000" /></div>'
    + '<div class="col-sm-3" ><input value=' + data.val().investmentReturn + ' required type="number" class="form-control" id="costs_percent_' + storage.yearCount + '" placeholder="7" /></div>')
}

function resetCostsData() {
  if (firebase.auth().currentUser) {
    var str = 'users/' + firebase.auth().currentUser.uid + '/profiles/' + storage.simulation + '/costs';
    // console.log(str);
    firebase.database().ref(str).remove();
  }
  else notSignedIn();
}