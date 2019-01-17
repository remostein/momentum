//Main code

/*****************************************
///////      DIARY STATISTICS      ///////
*****************************************/

var diaryStatistics = (function () {
  
    var Word = function(word){
        this.word = word;
        this.count = 1;
        this.momentIDs = [];
        this.momentRating = [];
        this.avgRating = 0;
        this.dateIDs = [];
    };
    
    // diary moment entry object
    var MomentStats = function (idMoment, dateID, description, tags, momentRating) {
        this.idMoment = idMoment;
        this.dateID = dateID;
        this.description = description;
        this.tags = tags;
        this.momentRating = momentRating;
    };
    
    var DateStats = function(dateID, toString){
        this.dateID = dateID;
        this.momentIDs = [];
        this.dateRating = [];
        this.avgRating = 0;
        this.toString = toString;
    };
    
    var data = {
        allWords: [],
        allMoments: [],
        allDatesStats: []
    };
    
    var getMomentByID = function(momentID){
        var indexOfMoment;  
        indexOfMoment = findWithAttr(data.allMoments, 'idMoment', momentID);  
        if (indexOfMoment === -1) {
            return -1;
        } else {
            return data.allMoments[indexOfMoment];
        }
    };
    
    var getDateByID = function(dateID){
        var indexOfDate;  
        indexOfDate = findWithAttr(data.allDatesStats, 'dateID', dateID);  
        if (indexOfDate === -1) {
            return -1;
        } else {
            return data.allDatesStats[indexOfDate];
        }        
    };
    
    var momentToWords = function(moment){
        var momentWords, descrption, tags, allmomentWords, temp;
        // Trimming duplicate spaces
        allmomentWords = singleSpace(moment.description + ' ' + moment.tags);
        // changing to lowercase
        allmomentWords = allmomentWords.toLowerCase();
        // Creating words array from moment
        momentWords = allmomentWords.split(' ');
        return momentWords;
        
    };
    
    var singleSpace = function(allmomentWordsSpaces) {
        var regex;
        regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        allmomentWordsSpaces = allmomentWordsSpaces.replace(regex," ");
        allmomentWordsSpaces = allmomentWordsSpaces.trim();
        regex = / +(?= )/g;
        allmomentWordsSpaces = allmomentWordsSpaces.replace(regex,'');
        return allmomentWordsSpaces;
    };
    
    var compareWordsByCount = function(word1, word2){
        if(word1.count < word2.count) return 1;
        if(word1.count > word2.count) return -1;
        return 0;
    };
    
    var compareWordsByLikes = function(word1, word2){
        if(word1.avgRating > word2.avgRating) return 1;
        if(word1.avgRating < word2.avgRating) return -1;
        return 0;
    };
    
    var compareDatesByLikes = function(date1, date2){     
        if(date1.AvgRating > date2.AvgRating) return 1;
        if(date1.AvgRating < date2.AvgRating) return -1;
        return 0;        
    };
    
    // Generic find function by field of an object inside an array
    // For example: data.allWords, word, 'Pool'
    var findWithAttr = function(array, attr, item) {
        for (var i = 0; i < array.length; i++) {
            if(array[i][attr] === item){
                return i;
            }
        }
        return -1;
    };
    
    var generateDataSetByAttr = function(array, attr){
        var dataSet = [];
        for (var i = 0; i < array.length; i++){
            dataSet.push(array[i][attr]);
        }
        return dataSet;
    };
    
    var updateDateAvgRating = function(dateID){
        var datesAvgRating = 0;
        var tempDate = getDateByID(dateID);
        tempDate.dateRating.forEach(function(element){
            datesAvgRating += parseInt(element);
        });
        datesAvgRating = datesAvgRating / tempDate.dateRating.length;
        tempDate.avgRating = datesAvgRating;
    };
    
    var cloneMoment = function(moment, dateID){
        var momentStats = new MomentStats(moment.idMoment, dateID, moment.description, moment.tags, moment.momentRating);
        return momentStats;
    };
    
    return {
        
        updateStatisticsAdd: function(moment, dateID, dateToString) {
            var momentWords, indexOfDate, tempDate, clonedMoment;
            momentWords = momentToWords(moment);
            momentWords.forEach(function(word){
                var indexOfWord, tempWord;
                indexOfWord = findWithAttr(data.allWords, 'word', word);
                if (indexOfWord !== -1){
                    // Word exist
                    tempWord = data.allWords[indexOfWord];
                    tempWord.count++;
                } else {
                    tempWord = new Word(word);
                    data.allWords.push(tempWord);
                }
                tempWord.momentIDs.push(moment.idMoment);
                tempWord.momentRating.push(moment.momentRating);
                tempWord.avgRating = (((tempWord.avgRating * (tempWord.count - 1)) + moment.momentRating) / tempWord.count);
                tempWord.dateIDs.push(dateID);
            });
            // Check if date exist
            indexOfDate = findWithAttr(data.allDatesStats, 'dateID', dateID);
            if(indexOfDate === -1){
                tempDate = new DateStats(dateID, dateToString);
                data.allDatesStats.push(tempDate);
            } else {
                tempDate = data.allDatesStats[indexOfDate];
            }
            tempDate.dateRating.push(moment.momentRating);
            tempDate.momentIDs.push(moment.idMoment);
            clonedMoment = cloneMoment(moment);
            data.allMoments.push(clonedMoment);
            updateDateAvgRating(dateID);
        },
        
        updateStatisticsEdit: function(moment, dateID, dateToString){
            diaryStatistics.updateStatisticsDelete(moment.idMoment, dateID);
            diaryStatistics.updateStatisticsAdd(moment, dateID, dateToString);
            updateDateAvgRating(dateID);
        },
        
        updateStatisticsDelete: function(momentID, dateID) {
            var momentWords, indexOfDate, tempDate, momentToDelete;
            momentToDelete = getMomentByID(momentID);
            tempDate = getDateByID(dateID);
            momentWords = momentToWords(momentToDelete);
            momentWords.forEach(function(wordToDelete){
                var indexOfWord = findWithAttr(data.allWords, 'word', wordToDelete);
                if(indexOfWord === -1) {
                    alert("Couldn't find word to delete");
                } else {
                    var word = data.allWords[indexOfWord];
                    if(word.count !== 1){
                        word.count--;
                        word.momentIDs.splice(word.momentIDs.indexOf(momentID), 1);
                        word.momentRating.splice(word.momentRating.indexOf(momentToDelete.momentRating), 1);
                        word.avgRating = (((word.avgRating * (word.count + 1)) - momentToDelete.momentRating) / word.count);
                        word.dateIDs.splice(word.dateIDs.indexOf(dateID), 1);
                    } else {
                        data.allWords.splice(data.allWords.indexOf(word), 1);
                    }                     
                }
            });
            if(tempDate.momentIDs.length > 1) {
                tempDate.momentIDs.splice(tempDate.momentIDs.indexOf(momentID), 1);
                tempDate.dateRating.splice(tempDate.dateRating.indexOf(momentToDelete.momentRating), 1);
                updateDateAvgRating(dateID);
            } else {
                data.allDatesStats.splice(findWithAttr(data.allDatesStats, 'dateID', dateID), 1);
            }
            data.allMoments.splice(data.allMoments.indexOf(momentToDelete), 1);
            
        },
        
        getStatsByOperation: function(operation, limit, max){
            var elementList, countList;
            switch(operation){
                case 0: 
                    data.allWords.sort(compareWordsByCount); 
                    if(!max){
                          data.allWords.reverse();
                    }
                    elementList = generateDataSetByAttr(data.allWords, 'word');
                    countList = generateDataSetByAttr(data.allWords, 'count');
                    break;
                case 1:
                    data.allWords.sort(compareWordsByLikes); 
                    if(max){
                          data.allWords.reverse();
                    }
                    elementList = generateDataSetByAttr(data.allWords, 'word');
                    countList = generateDataSetByAttr(data.allWords, 'avgRating');                    
                    break;                   
                case 2:
                    data.allDatesStats.sort(compareDatesByLikes);
                    if(max){
                          data.allDatesStats.reverse();
                    }                    
                    elementList = generateDataSetByAttr(data.allDatesStats, 'toString');
                    countList = generateDataSetByAttr(data.allDatesStats, 'avgRating');
                    //
                    break;  
            }
            
            elementList = elementList.slice(0, limit);
            countList = countList.slice(0, limit);
            return [elementList, countList];
        },
        
        wordCounter: function() {
            var wordList, countList;
            data.allWords.sort(compareWordsByCount);
            wordList = generateDataSetByAttr(data.allWords, 'word');
            countList = generateDataSetByAttr(data.allWords, 'count');
            return [wordList,countList];
        },
        
        wordLikes: function() {
            var wordList, countList;
            data.allWords.sort(compareWordsByLikes);
            wordList = generateDataSetByAttr(data.allWords, 'word');
            countList = generateDataSetByAttr(data.allWords, 'avgRating');
            return [wordList,countList];            
        },
        
        dateLikes: function() {
            var dateList, countList;
            data.allDatesStats.sort(compareDatesByLikes);
            dateList = generateDataSetByAttr(data.allDatesStats, 'dateID');
            countList = generateDataSetByAttr(data.allDatesStats, 'avgRating');
            return [dateList,countList];  
        },
        
        test: function() {
            console.log(data);
        }
        
    };
})();


/*****************************************
///////         DIARY DATA         ///////
*****************************************/

var diaryData = (function () {

    var languagePreset = 'en-US';
    var languageOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    // diary moment entry object
    var MomentEntry = function (idMoment, date, description, tags, momentRating) {
        this.idMoment = idMoment;
        this.date = date;
        this.description = description;
        this.tags = tags;
        this.momentRating = momentRating;
    };

    //diary date object - uses diary entry object
    var DateEntry = function (idDate, dateComponent) {
        this.idDate = idDate;
        this.dateComponent = dateComponent;
        this.momentsListByID = [];
        this.dateRating = 0;

    };

    var data = {
        allDates: [],
        allMoments: []
    };

    function compareDates(a, b) {
        if (a.idDate > b.idDate)
            return -1;
        if (a.idDate < b.idDate)
            return 1;
        return 0;
    };

    /////////////////////////////////////////
    /////////Date prototype changes//////////
    /////////////////////////////////////////
    Date.prototype.toDiaryStringLong = function () {
        var longString = this.fetchDayString() + ", " + this.getDate() + " " + this.fetchMonthString() + ", " + this.getFullYear();
        return longString;
    };

    Date.prototype.toDiaryStringShort = function () {
        var shortString = this.getDate() + " " + this.fetchMonthString() + ", " + this.getFullYear();
        return shortString;

    };

    Date.prototype.fetchMonthString = function () {
        var months;
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[this.getMonth()];
    };

    Date.prototype.fetchDayString = function () {
        var days;
        day = this.getDay();
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    };

    /////////////////////////////////////////
    //   Local date string with lnaguage   //   
    Date.prototype.toStringLang = function () {
        return this.toLocaleDateString(languagePreset, languageOptions);
    };

    return {

        //AddMoment
        addMoment: function (mom_date, mom_description, mom_tags, mom_rating) {
            var newMoment, momentID;

            // Create new ID

            if (data.allMoments.length > 0) {
                momentID = data.allMoments[data.allMoments.length - 1].idMoment + 1;
            } else {
                momentID = 0;
            }

            //Create new moment
            newMoment = new MomentEntry(momentID, mom_date, mom_description, mom_tags, mom_rating);
            data.allMoments.push(newMoment);            
            return newMoment;
        },

        //AddDate
        addDate: function (mom_date) {
            var newDate;
            //date Entry does not exist so we create a new one
            newDate = new DateEntry(diaryData.generateDateID(mom_date), mom_date);
            data.allDates.push(newDate);
            data.allDates.sort(compareDates)
            return newDate;
        },

        // DeleteMoment - returns false if date is empty
        deleteMoment: function (momentID) {
            var moment, dateEntry, indexOfMoment, indexOfDate;
            moment = diaryData.getMomentByID(momentID);
            dateEntry = diaryData.getDateEntryByMomentID(momentID);
            indexOfMoment = dateEntry.momentsListByID.indexOf(momentID);
            indexOfDate = data.allDates.indexOf(dateEntry);
            data.allDates[indexOfDate].momentsListByID.splice(indexOfMoment, 1);
            data.allMoments.splice(data.allMoments.indexOf(moment), 1);
            // Check if date is empty
            if (data.allDates[indexOfDate].momentsListByID.length === 0) {
                return false;
            }            
            return true;
        },

        deleteDate: function (dateID) {
            var indexOfDate;
            indexOfDate = data.allDates.indexOf(diaryData.getDateEntryByID(dateID));
            data.allDates.splice(indexOfDate, 1);
        },
        
        generateDateID: function (date) {
            var dateID = (date.getFullYear() * 10000) + ((date.getMonth() + 1) * 100) + date.getDate();           
            return dateID;
        },

        // Get dateEntry by moment ID
        getDateEntryByMomentID: function (momentID) {
            var momentsDate, dateID, moment;
            moment = diaryData.getMomentByID(momentID);
            dateID = diaryData.generateDateID(moment.date);
            momentsDate = diaryData.getDateEntryByID(dateID);            
            return momentsDate;
        },

        // Get dateEntry by date ID
        getDateEntryByID: function (dateID) {
            for (var i = 0; i < data.allDates.length; i++) {
                if (data.allDates[i].idDate == dateID) {
                    return data.allDates[i];
                }
            }            
            return -1;
        },

        getAllDates: function () {
            return data.allDates;
        },

        getMomentByID: function (id) {
            for (var i = 0; i < data.allMoments.length; i++) {
                if (data.allMoments[i].idMoment == id) {                   
                    return data.allMoments[i];
                }
            }
        },

        getMomentListByDateEntry: function (dateEntry) {
            var moments = [];
            dateEntry.momentsListByID.forEach(function (element) {
                moments.push(diaryData.getMomentByID(element));
            });           
            return moments;
        },

        checkIfDateExist: function (e_date) {
            if (data.allDates.length == 0) return false;
            for (var i = 0; i < data.allDates.length; i++) {
                if (e_date.toDateString() == data.allDates[i].dateComponent.toDateString()) {
                    return data.allDates[i];
                }
            }
            return false;
        },

        test: function () {
            console.log(data);
        }
    };
})();



/*****************************************
///////          DIARY UI          ///////
*****************************************/

var diaryUI = (function () {

    var DOMstrings = {
        btnAddModal: "btn_add_modal",
        btnSaveModal: "btn_save_modal",
        btnMainAddMoment: "btn_main_add_moment",
        btnEditMoment: "btn_edit_moment-",
        btnDeleteMoment: "btn_delete_moment-",
        modalDate: "modalDate",
        inputDescription: '.add__description',
        inputTags: '.add__tags',
        inputStar: 'star',
        closeModal: "btn-close-modal",
        btnClassModal: "btn-modal",
        modalWindowID: "myModal",
        statisticsTab: "statistics-tab",
        datesID: "timeline-",
        datesContainer: '.timeline__list',
        momentsContainer: '.moments__list',
        addMomentModal: '#myModal',
        btnStatsControl: "btn_stats_control",
        labelWordCounter: "label_word-counter",
        labelWordLikes: "label_word-likes",
        labelDateLikes: "label_date-likes",
        chartContainer: "chart-container",
        chartWordCounter: "word-counter",
        chartWordLikes: "word-likes",
        chartDateLikes: "date-likes",
        msgNoRating: "No rating",
        alertInsertDescription: "Please insert description"

    };

    var Rating = function (rating) {
        this.rating = rating;
    };

    var getRatingInput = function () {
        var stars, i;
        stars = document.getElementsByName(DOMstrings.inputStar);
        for (i = 0; i < stars.length; i++) {
            if (stars[i].checked) {
                return parseInt(stars[i].value);
            }
        }
        return 0;
    };

    return {
        // Fetching input from modal
        getInput: function () {
            var ratingInput = getRatingInput();
            return {
                date: $('#datepicker').datepicker("getDate"),
                description: document.querySelector(DOMstrings.inputDescription).value,
                tags: document.querySelector(DOMstrings.inputTags).value,
                momentRating: ratingInput,
            };
        },

        //add list date
        addDateToList: function (obj) {
            var html, newHtml;
            // Create HTML string with placeholder text

            html = '<div class="item clearfix date__item" id="timeline-%id%"><span class="item__edit__btn"><i class="fa fa-pencil"></i></span><div class="date__text">%date%</div>';

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.idDate);
            newHtml = newHtml.replace('%date%', obj.dateComponent.toDiaryStringShort());

            // Insert the HTML into the DOM
            document.querySelector(DOMstrings.datesContainer).insertAdjacentHTML('beforeend', newHtml);
        },

        //add list moment
        addMomentToList: function (obj) {
            var html, newHtml, star_ratingHtml, star_rating, index;
            // Create HTML string with placeholder text
            html = '<div class="moment__item item clearfix" id="moment-%id%"><span class="item__edit__btn"><i class="fa fa-pencil" id="btn_edit_moment-%id%"></i></span><div class="moment__text">%moment%<div class="tags__text">%tags%</div></div><span class="item__delete__btn" id="btn_delete_moment-%id%"><i class="fa fa-times-circle-o"></i></span><div class="stars-rating-display">%star-rating-display%</div></div>';

            // Replace the placeholder text with some actual data
            newHtml = html.replace(/%id%/g, obj.idMoment);
            newHtml = newHtml.replace('%moment%', obj.description);
            newHtml = newHtml.replace('%tags%', obj.tags);

            // Creating star rating display
            star_rating = obj.momentRating;
            star_ratingHtml = '';
            if (star_rating == 0) {
                star_ratingHtml = '<div class="msg_no_rating">' + DOMstrings.msgNoRating + '</div>';
            } else {
                for (index = 0; index < star_rating; index++) {
                    star_ratingHtml += '<span class="fa fa-star star_checked"></span>';
                }
                for (index; index < 5; index++) {
                    star_ratingHtml += '<span class="fa fa-star"></span>';
                }
            }
            newHtml = newHtml.replace('%star-rating-display%', star_ratingHtml);
            // Insert the HTML into the DOM
            document.querySelector(DOMstrings.momentsContainer).insertAdjacentHTML('beforeend', newHtml);
        },

        loadModalEditMoment: function (moment) {
            $(DOMstrings.addMomentModal).modal('show');
            // Show edit button
            diaryUI.revealDivByClassAndID(DOMstrings.btnClassModal, DOMstrings.btnSaveModal);
            // Insert moment data to modal
            document.getElementById(DOMstrings.modalDate).innerHTML = moment.date.toDateString();
            document.querySelector(DOMstrings.inputDescription).value = moment.description;
            document.querySelector(DOMstrings.inputTags).value = moment.tags;
            if (moment.momentRating != 0) {
                document.getElementById(DOMstrings.inputStar + '-' + moment.momentRating).checked = true;
            }

        },

        loadModalAddMoment: function () {
            document.getElementById(DOMstrings.modalDate).innerHTML = $('#datepicker').datepicker("getDate").toDateString();
            // Show add button
            diaryUI.revealDivByClassAndID(DOMstrings.btnClassModal, DOMstrings.btnAddModal);
        },

        //delete list items

        //clear the dates container
        clearDates: function () {
            document.querySelector(DOMstrings.datesContainer).innerHTML = "";
        },

        // clear the moments container
        clearMoments: function () {
            document.querySelector(DOMstrings.momentsContainer).innerHTML = "";
        },

        // clear modal fields
        clearFields: function () {
            var fields, fieldsArr, stars;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputTags);

            fieldsArr = Array.prototype.slice.call(fields);
            // Clear description and tags
            fieldsArr.forEach(function (element, index, array) {
                element.value = "";
            });
            // Clear stars
            stars = document.getElementsByName(DOMstrings.inputStar);
            stars.forEach(function (element) {
                element.checked = false;
            });
        },

        makeDateActive: function (dateEntry) {
            var current, id;
            id = DOMstrings.datesID + dateEntry.idDate;
            var current = document.getElementsByClassName("active");
            // If there's no active class
            if (current.length > 0) {
                current[0].className = current[0].className.replace(" active", "");
            }
            document.getElementById(id).className += " active";
        },

        loadMoments: function (momentsList) {
            diaryUI.clearMoments();
            momentsList.forEach(function (element) {
                diaryUI.addMomentToList(element);
                // setup event listeners for edit / delete
                var btnEditElement = document.getElementById(DOMstrings.btnEditMoment + element.idMoment);
                btnEditElement.addEventListener('click', function () {
                    controller.ctrlLoadEditMoment(element.idMoment);
                });
                var btnDeleteElement = document.getElementById(DOMstrings.btnDeleteMoment + element.idMoment);
                btnDeleteElement.addEventListener('click', function () {
                    // Confirm modal using bootbox
                    bootbox.confirm({
                        message: "Are you sure you want to delete this moment?",
                        buttons: {
                            confirm: {
                                label: 'Yes',
                                className: 'btn-warning'
                            },
                            cancel: {
                                label: 'No',
                                className: 'btn-dark'
                            }
                        },
                        callback: function (result) {
                            if (result){
                                controller.ctrlDeleteMoment(element.idMoment);
                            } 
                        }
                    });
                    
                });
            })
        },

        loadDates: function (datesList) {
            diaryUI.clearDates();
            datesList.forEach(function (element) {
                diaryUI.addDateToList(element);
                //Adds event listener for activating on click
                var dateElementID = DOMstrings.datesID + element.idDate;
                document.getElementById(dateElementID).addEventListener("click", function () {
                    diaryUI.makeDateActive(element);
                    var tempMomentList = diaryData.getMomentListByDateEntry(element);
                    diaryUI.loadMoments(tempMomentList);
                });
            });
        },
        
        revealDivByClassAndID: function(className, divID){
            var listOfClassItems;
            listOfClassItems = document.getElementsByClassName(className);
            Array.prototype.forEach.call(listOfClassItems, element => {
                element.style.display = 'none';
            });
            document.getElementById(divID).style.display = 'block';
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();


/*****************************************
///////      DIARY CHARTS      ///////
*****************************************/

var diaryCharts = (function () {
    
    var diaryChart;
    
    var initChart = function(elementID, type, labels, topLabel, data){
        if (typeof diaryChart !== 'undefined'){
            diaryChart.destroy();
        }
        var colors = generateChartRGBAColors(labels.length);
        var ctx = document.getElementById(elementID).getContext('2d');
        Chart.defaults.global.defaultFontFamily = 'Ubuntu';
        var wcChart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: topLabel,
                    data: data,
                    backgroundColor: colors[0]
                    
                    /*[
                        'rgba(255, 99, 132, 0.2)'
                    ]*/
                    ,
                    borderColor: colors[1]
                    /*[
                        'rgba(255, 99, 132, 1)'
                    ]*/
                    ,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
        diaryChart = wcChart;
    };
    
    var generateChartRGBAColors = function(amount){
        var backgroundColorList = [];
        var borderColorList = [];
        for(var i = 0; i < amount; i++){
            var backgroundColor, borderColor;
            backgroundColor = 'rgba(';
            borderColor = 'rgba(';
            for(var rgb = 0; rgb < 3; rgb++) {
                var randomNum = (Math.floor((Math.random() * 250)) + 1);
                backgroundColor += randomNum.toString() + ', ';
                borderColor += randomNum.toString() + ', ';
            }
            backgroundColor += "0.2)";
            borderColor += "1)";
            backgroundColorList.push(backgroundColor);
            borderColorList.push(borderColor);
        }
        return [backgroundColorList, borderColorList];
        
    };
    
    return {
        
        loadDataByOperation: function(operation, statsData){
            var labels, data;
            labels = statsData[0];
            data = statsData[1];            
            switch(operation) {
                case 0:
                    initChart("word-counter-chart", 'bar', labels,"#number of apperances", data);
                    break;
                case 1:
                    initChart("word-likes-chart", 'bar', labels,"#average of likes per word", data);
                    break;
                case 2:
                    initChart("date-likes-chart", 'bar', labels,"#average of likes per day", data);
                    break;
            }
        },
        
        loadWordCounterData: function(wordsData){
            var labels, data;
            labels = wordsData[0];
            data = wordsData[1];
            initChart("word-counter-chart", 'bar', labels,"#number of apperances", data);
        },
        
        loadWordLikesData: function(wordsData){
            var labels, data;
            labels = wordsData[0];
            data = wordsData[1];
            initChart("word-likes-chart", 'bar', labels,"#number of likes", data);
        },
        
        loadDateLikesData: function(datesData){
            var labels, data;
            labels = datesData[0];
            data = datesData[1];
            initChart("date-likes-chart", 'bar', labels,"#number of likes", data);
        },
        
        updateChart: function(){
            diaryChart.update();
        }
        
    };
})();

/*****************************************
///////      DIARY CONTROLLER      ///////
*****************************************/

var controller = (function (ctrlDiaryData, ctrlDiaryUI, ctrlDiaryStat, ctrlDiaryCharts) {
    //Loading the DOMstrings from UI to controller
    var DOM = ctrlDiaryUI.getDOMstrings();

    var statsCtrl = {
        operation: 0,
        limit: 10,
        max: true
    };
    
    var setupEventListeners = function () {

        document.getElementById(DOM.btnMainAddMoment).addEventListener('click', ctrlDiaryUI.loadModalAddMoment);
        document.getElementById(DOM.btnAddModal).addEventListener('click', ctrlAddMoment);
        document.getElementById(DOM.modalWindowID).addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddMoment();
                $(DOM.addMomentModal).modal('hide');
            }
        });
        // Modal closing event listener
        document.getElementById(DOM.closeModal).addEventListener('click', ctrlDiaryUI.clearFields); 
        // Statistics Load
        document.getElementById(DOM.statisticsTab).addEventListener('click', function(event){
            var current, currentID;
            current = document.getElementsByClassName("active-title");
            currentID = current[0].id.split('_');
            loadStats(currentID[1]);
        });
        
        // Graphs labels event listeners
        // Add active class to the current title
        var header = document.getElementById("stats-nav");
        var btns = header.getElementsByClassName("nav-link");
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function() {
                var current = document.getElementsByClassName("active-title");
                current[0].className = current[0].className.replace(" active-title", "");
                this.className += " active-title";
                // Hide / Reveal content
                var operation = this.name.split('_');
                // loadDataByOperaction AND genericOperation()
                statsCtrl.operation = parseInt(operation[1]);
                loadStats(operation[0]);           
            });
        }
        
        document.getElementById(DOM.btnStatsControl).addEventListener('click', updateStatsSettings); 
        
    };
    
    var loadStats = function(elementID) {
        var statsData = ctrlDiaryStat.getStatsByOperation(statsCtrl.operation, statsCtrl.limit, statsCtrl.max);
        ctrlDiaryCharts.loadDataByOperation(statsCtrl.operation, statsData);
        ctrlDiaryUI.revealDivByClassAndID(DOM.chartContainer, elementID);         
    };

    // Ctrl add moment
    var ctrlAddMoment = function () {
        var input, newMoment, newDate, prevDateID;

        // 1. Get the input data from modal
        input = ctrlDiaryUI.getInput();

        if (input.description !== "") {
            // 2. Check if date exist
            newDate = ctrlDiaryData.checkIfDateExist(input.date);

            // 3. If date does not exist, add it to the diary data and to UI
            //    !newDate is true if the input.date does not exist in diary data
            //    If date exist in diary data, then newDate is that DateEntry
            if (!newDate) {
                //Adds to the diary data and sorts it by id
                newDate = ctrlDiaryData.addDate(input.date);
                allDatesSorted = ctrlDiaryData.getAllDates();
                ctrlDiaryUI.loadDates(allDatesSorted);
            }

            // 4. Make the newDate active
            ctrlDiaryUI.makeDateActive(newDate);

            // 5. Add the moment to the diary data
            newMoment = ctrlDiaryData.addMoment(input.date, input.description, input.tags, input.momentRating);

            // 6. Add the moment ID to the date entry
            newDate.momentsListByID.push(newMoment.idMoment);

            // 7. add the moment to UI
            ctrlDiaryUI.loadMoments(ctrlDiaryData.getMomentListByDateEntry(newDate));

            // 8. Clear the input fields
            ctrlDiaryUI.clearFields();
            
            // 9. Send moment to statistics
            ctrlDiaryStat.updateStatisticsAdd(newMoment, newDate.idDate, newDate.dateComponent.toDiaryStringShort());
            //If no description was entered - send alert
        } else alert(DOM.alertInsertDescription);
    };

    // Ctrl save modal changes when editing
    // Called when clicking on Save button
    var ctrlSaveModalEdit = function (moment) {
        var input;
        input = ctrlDiaryUI.getInput();
        if (input.description !== "") {
            moment.description = input.description;
            moment.tags = input.tags;
            moment.momentRating = input.momentRating;
            // updating the statistics obj
            ctrlDiaryStat.updateStatisticsEdit(moment, ctrlDiaryData.generateDateID(moment.date), moment.date.toDiaryStringShort());
            // load the saved moment to UI
            ctrlDiaryUI.loadMoments(ctrlDiaryData.getMomentListByDateEntry(ctrlDiaryData.getDateEntryByMomentID(moment.idMoment)));
            // 8. Clear the fields
            ctrlDiaryUI.clearFields();
            //If no description was entered - send alert
        } else alert(DOM.alertInserDescription);
    };
    
    var updateStatsSettings = function() {
        var sortMax, limit, current, currentID;
        if (document.getElementById('radio-up').checked == true) {
            sortMax = true;
        } else {
            sortMax = false;
        }
        
        limit = document.getElementById('stats-limit').value;
        statsCtrl.limit = limit;
        statsCtrl.max = sortMax;
        current = document.getElementsByClassName("active-title");
        currentID = current[0].id.split('_');
        loadStats(currentID[1]);
    };


    return {
        init: function () {
            console.log('Application has started.');
            setupEventListeners();
        },

        ctrlLoadEditMoment: function (momentID) {
            var thisMoment, oldButton, newButton;
            thisMoment = ctrlDiaryData.getMomentByID(momentID);
            ctrlDiaryUI.loadModalEditMoment(thisMoment);
            // Remove event listeners for Save button
            oldButton = document.getElementById(DOM.btnSaveModal);
            newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
            // Creating a new event listener for Save button
            newButton.addEventListener('click', function () {
                ctrlSaveModalEdit(thisMoment);
            });
        },

        ctrlDeleteMoment: function (momentID) {
            var dateEntry, moment, isDateFull, allDatesSorted, dateID;
            moment = ctrlDiaryData.getMomentByID(momentID);
            dateEntry = ctrlDiaryData.getDateEntryByMomentID(momentID);
            dateID = dateEntry.idDate;
            isDateFull = ctrlDiaryData.deleteMoment(momentID);
            if (isDateFull == false) {
                ctrlDiaryData.deleteDate(dateEntry.idDate);
                allDatesSorted = ctrlDiaryData.getAllDates();
                ctrlDiaryUI.loadDates(allDatesSorted);
                if (allDatesSorted.length != 0) {
                    dateEntry = allDatesSorted[0];
                    ctrlDiaryUI.makeDateActive(dateEntry);
                }
            }
            ctrlDiaryStat.updateStatisticsDelete(momentID, dateID);
            ctrlDiaryUI.loadMoments(ctrlDiaryData.getMomentListByDateEntry(dateEntry));
        }
    };

})(diaryData, diaryUI, diaryStatistics, diaryCharts);

//controller.init();

var logIn = (function () {
   
    return {
        init: function() {
            
            document.getElementById('site-content').style.display = 'none';
            document.getElementById('check').addEventListener('click', function(event){
                document.getElementById('site-content').style.display = 'block';
                document.getElementById('log-in').style.display = 'none';
                controller.init();
            });
        }    
    };
})();

logIn.init();

//modal description focus
$('#myModal').on('shown.bs.modal', function () {
    $('#add__description').focus();
})

//Date picker script
$(function () {
    $('#datepicker').datepicker({
        format: "dd/mm/yyyy",
        autoclose: true,
        todayHighlight: true,
        showOtherMonths: true,
        selectOtherMonths: true,
        autoclose: true,
        changeMonth: true,
        changeYear: true,
        orientation: "button"
    }).datepicker('update', new Date());
});
