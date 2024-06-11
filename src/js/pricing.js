(() => {
  /****************************
   *
   * GLOBAL VARIABLES
   *
   ****************************/
  const toggle = $(".summary_toggle");
  const toggleDot = $(".toggle_dot");
  const monthlyRadio = $("#monthly");
  const annualRadio = $("#annual");
  const helpdeskPlan = $('[data-plan="helpdesk"]');
  const helpdeskPriceDisplay = $('[data-price="helpdesk-plan"]');
  const helpdeskPrice = $('[data-price="helpdesk"]');
  const automatePrice = $('[data-price="automate"]');
  const voicePrice = $('[data-price="voice"]');
  const smsPrice = $('[data-price="sms"]');
  const enterpriseInfo = $('[data-info="enterprise"]');
  const helpdeskSummary = $('[data-summary="helpdesk"]');
  const automateSummary = $('[data-summary="automate"]');
  const voiceSummary = $('[data-summary="voice"]');
  const smsSummary = $('[data-summary="sms"]');
  const summaryPlaceholder = $(".summary_placeholder");
  const removeAutomate = $('[data-summary="automate-remove"]');
  const frequency = $('[data-type="frequency"]');
  const totalPrice = $('[data-price="total-price"]');
  const ticketNumber = $('[data-range="ticket-number"]');
  const automateNumber = $('[data-range="automate-number"]');
  const slider = $('[data-el="range-slider"]');
  const automateSlider = $('[data-el="automate-slider"]');
  const helpdeskPlans = [
    ["Starter", 10, 0, 50],
    ["Basic", 60, 51, 300],
    ["Pro", 360, 301, 2000],
    ["Advanced", 900, 2001, 4999],
    ["Enterprise", "Contact us", 5000, Infinity],
  ];
  const voiceTiers = [
    { range: "No Voice Tickets", tier: "Tier 0", price: 0 },
    { range: "Pay as you go", tier: "Pay as you go", price: 0 },
    { range: "0-24", tier: "Tier 1", price: 30 },
    { range: "25-74", tier: "Tier 2", price: 90 },
    { range: "75-149", tier: "Tier 3", price: 135 },
    { range: "150-249", tier: "Tier 4", price: 175 },
    { range: "250-499", tier: "Tier 5", price: 250 },
    { range: "500-999", tier: "Tier 6", price: 400 },
    { range: "999+", tier: "Tier 7", price: 0 },
  ];
  const smsTiers = [
    { range: "No SMS Tickets", tier: "Tier 0", price: 0 },
    { range: "Pay as you go", tier: "Pay as you go", price: 0 },
    { range: "0-24", tier: "Tier 1", price: 20 },
    { range: "25-74", tier: "Tier 2", price: 60 },
    { range: "75-149", tier: "Tier 3", price: 90 },
    { range: "150-249", tier: "Tier 4", price: 140 },
    { range: "250-499", tier: "Tier 5", price: 216 },
    { range: "500-999", tier: "Tier 6", price: 408 },
    { range: "999+", tier: "Tier 7", price: 0 },
  ];
  const planMin = $('[data-range="plan-min"]');
  const planMax = $('[data-range="plan-max"]');
  const helpdeskCTA = $('[data-button="helpdesk"]');
  const automateCTA = $('[data-button="automate"]');
  const automateSkipCTA = $('[data-button="automate-skip"]');
  const voiceCTA = $('[data-button="voice"]');
  const voiceSkipCTA = $('[data-button="voice-skip"]');
  const smsCTA = $('[data-button="sms"]');
  const smsSkipCTA = $('[data-button="sms-skip"]');
  const tab1 = $('[data-link="tab1"]');
  const tab2 = $('[data-link="tab2"]');
  const tabLink1 = $(".tab-link_1");
  const tabLink2 = $(".tab-link_2");
  const tabLink3 = $(".tab-link_3");
  let chosenPlanPrice;
  const entryTickets = $("[data-type='customer-interact-without']");
  const entryRate = document.getElementById("entryRate");

  /****************************
   *
   * BUSINESS LOGIC
   *
   ****************************/

  /** Function to find the appropriate helpdesk plan based on the number of tickets */
  function updateHelpdeskPlan(tickets) {
    // Validate tickets input
    if (isNaN(tickets) || tickets < 0) {
      console.error("Invalid ticket number:", tickets);
      return ["No plan available", "", "", Infinity];
    }

    // Find the appropriate plan
    let selectedPlan = helpdeskPlans.find(
      (plan) => tickets >= plan[2] && (tickets <= plan[3] || plan[3] === Infinity)
    );

    // Default to "No plan available" if no match is found
    if (!selectedPlan) {
      console.error("No plan found for tickets:", tickets);
      selectedPlan = ["No plan available", "", "", Infinity];
    }

    return selectedPlan;
  }

  /** Function to calculate the total price, applying discounts for annual plans */
  function calculateTotalPrice(isAnnual) {
    // Extract and parse prices
    let prices = [helpdeskPrice, automatePrice, voicePrice, smsPrice].map(
      (p) => parseFloat(p.text().replace(/[^\d.-]/g, "")) || 0
    );

    // Apply annual discount if applicable
    if (isAnnual) {
      prices = prices.map((price) => price * (10 / 12));
    }

    // Calculate total price
    return prices.reduce((sum, price) => sum + price, 0);
  }

  /****************************
   *
   * UI UPDATE
   *
   ****************************/
  /** Function to update the visible CTA group based on the selected helpdesk plan */
  function updateCTAGroup(plan) {
    // Define CTA groups and reset display
    const ctaGroups = {
      Starter: $(".starter-ctas"),
      Basic: $(".basic-ctas"),
      Pro: $(".pro-ctas"),
      Advanced: $(".advanced-ctas"),
      Enterprise: $(".enterprise-ctas")
    };

    Object.values(ctaGroups).forEach(cta => cta.css("display", "none"));
    const helpdeskCTA = $('[data-button="helpdesk"]');
    const demoCTA = $(".demo-cta");
    const enterpriseInfo = $('[data-info="enterprise"]');

    // Update display based on the selected plan
    if (plan in ctaGroups) {
      ctaGroups[plan].css("display", "flex");
      if (plan === "Enterprise") {
        helpdeskCTA.css("display", "none");
        demoCTA.css("display", "flex");
        enterpriseInfo.css("display", "inline-block");
      } else {
        helpdeskCTA.css("display", "flex");
        demoCTA.css("display", "none");
        enterpriseInfo.css("display", "none");
      }
    } else {
      ctaGroups.Pro.css("display", "flex");
    }
  }

  // Ensure displayPlanDetails updates the helpdesk price correctly
  function displayPlanDetails(planDetails) {
    const [plan, price, min, max] = planDetails;
    const formattedMin = min === Infinity ? "+" : formatNumberWithCommas(min);
    const formattedMax = max === Infinity ? "+" : formatNumberWithCommas(max);
    const formattedPrice = price === "Contact us" ? price : `$${formatNumberWithCommas(price)}/mo`;

    helpdeskPlan.text(plan);
    planMin.text(formattedMin);
    planMax.text(formattedMax);
    helpdeskPriceDisplay.text(formattedPrice);
    helpdeskPrice.text(formattedPrice);

    updateCTAGroup(plan);
    updateTotalPrice();
  }

  /** Function to update the total price displayed on the UI */
  function displayTotalPrice(total) {
    const isEnterprisePlan = helpdeskPrice.text() === "Contact us";
    const totalItemElement = $(".summary_total");
    const dashElement = $(".is-dash");

    if (isEnterprisePlan) {
      totalItemElement.css("display", "none");
      totalPrice.text(" — ");
      dashElement.css("display", "none");
    } else {
      totalItemElement.css("display", "flex");
      dashElement.css("display", "inline-block");
      totalPrice.text(formatNumberWithCommas(total.toFixed(0)));
    }
  }

  /** Function to show/hide the automate alert based on automate number */
  function checkAndDisplayAutomateAlert() {
    const value = parseInt(automateNumber.val(), 10) || 0;
    $(".automate-alert").css("display", value < 30 ? "flex" : "none");
  }

  /** Function to sync ticket number input with entry tickets value */
  function syncTicketNumberWithEntryTickets() {
    const numericValue = parseInt(ticketNumber.val(), 10) || 0;
    entryTickets.val(numericValue);
    entryTickets.trigger("entryTicketsUpdated", [{ value: numericValue }]);
  }

  /** Function to sync the automate number with the entry rate */
  function syncEntryRateWithAutomateNumber() {
    const automateValue = automateNumber.val();
    if (entryRate) {
      entryRate.value = automateValue;
      entryRate.textContent = automateValue;
      $(entryRate).trigger("automateRateUpdated", [{ value: automateValue }]);
    }
  }

  /** Function to toggle back to monthly if we go below 60 tickets when on annual billing */
  function toggleToMonthlyIfBelow60(tickets) {
    if ($('input[name="billingCycle"]:checked').val() === "annual" && tickets < 60) {
      $("#monthly").prop("checked", true).trigger("change");
      $(toggle).removeClass("active");
      $(toggleDot).removeClass("active");
    }
  }

  /****************************
   *
   * EVENT HANDLERS & INITIALIZATION
   *
   ****************************/

  $('#monthly').prop('checked', true);
  const initialValue = 1500; // Set the initial value for the ticket count.
  const initialValueAutomate = 0; // Set the initial value for the ticket count.

  slider.val(initialValue).trigger("input");
  ticketNumber.val(initialValue);
  updateProgressBar(slider[0]);

  automateSlider.val(initialValueAutomate).trigger("input");
  automateNumber.val(initialValueAutomate);
  $(automateSummary).css("display", "none");

  checkAndDisplayAutomateAlert();
  syncTicketNumberWithEntryTickets(initialValue);

  let planDetails = updateHelpdeskPlan(initialValue);
  let total = calculateTotalPrice(false);

  displayPlanDetails(planDetails);
  displayTotalPrice(total);

  const voiceTicketsElement = document.querySelector("#voice-tickets");
  const smsTicketsElement = document.querySelector("#sms-tickets");

  if (voiceTicketsElement) {
    voiceTicketsElement.addEventListener("change", displaySelectedVoicePrice);
  }

  if (smsTicketsElement) {
    smsTicketsElement.addEventListener("change", displaySelectedSmsPrice);
  }

  // Handles helpdesk slider interactions
  slider.on("input", function () {
    const val = parseInt(this.value, 10);
    if (isNaN(val)) {
      console.error("Invalid slider value:", this.value);
      return;
    }

    ticketNumber.val(val);
    slider.attr("step", val < 1000 ? 10 : val < 2500 ? 100 : 500);

    toggleToMonthlyIfBelow60(val);

    const planDetails = updateHelpdeskPlan(val);
    if (!planDetails) {
      console.error("No plan details found for value:", val);
      return;
    }

    displayPlanDetails(planDetails);
    updateTotalPrice();
    updateProgressBar(this);
    syncTicketNumberWithEntryTickets();
    syncEntryRateWithAutomateNumber();
  });

  // Handles automate slider interactions
  automateSlider.on("input", function () {
    const val = parseInt(this.value, 10);
    if (isNaN(val)) {
      console.error("Invalid automate slider value:", this.value);
      return;
    }
    automateNumber.val(val);
    $(automateSummary).css("display", "flex");
    checkAndDisplayAutomateAlert();
    syncEntryRateWithAutomateNumber();
    updateAutomateProgressBar(this);
    updateTotalPrice();
  });


    // Function to handle the summary toggle logic
    function handleSummaryToggle() {
      const currentSelection = $('input[name="billingCycle"]:checked').val();
      const currentSliderValue = parseInt(slider.val(), 10);

      if (currentSliderValue < 60) {
          if (currentSelection === "monthly") {
              $("#annual").prop("checked", true).trigger("change");
              $(toggle).addClass("active");
              $(toggleDot).addClass("active");

              previousSliderValue = currentSliderValue;
              const annualSliderValue = 60;
              slider.val(annualSliderValue).trigger("input");
              ticketNumber.val(annualSliderValue);

              const planDetails = updateHelpdeskPlan(annualSliderValue);
              displayPlanDetails(planDetails);
              syncTicketNumberWithEntryTickets(annualSliderValue);
              updateProgressBar(slider[0]);
          } else {
              $("#monthly").prop("checked", true).trigger("change");
              $(toggle).removeClass("active");
              $(toggleDot).removeClass("active");

              slider.val(previousSliderValue).trigger("input");
              ticketNumber.val(previousSliderValue);

              const planDetails = updateHelpdeskPlan(previousSliderValue);
              displayPlanDetails(planDetails);
              syncTicketNumberWithEntryTickets(previousSliderValue);
              updateProgressBar(slider[0]);
          }
      } else {
          if (currentSelection === "monthly") {
              $("#annual").prop("checked", true).trigger("change");
              $(toggle).addClass("active");
              $(toggleDot).addClass("active");
          } else {
              $("#monthly").prop("checked", true).trigger("change");
              $(toggle).removeClass("active");
              $(toggleDot).removeClass("active");
          }
    }

    updateTotalPrice();
}


    // Attach the click event to the summary toggle
    $(".summary_toggle").off("click").on("click", function() {
      console.log('Summary toggle clicked');
      handleSummaryToggle();
  });


  // Update the radio button change event listener
  $('input[name="billingCycle"]').off("change").change(function () {
    updateTotalPrice();
    if ($(this).val() === "annual") {
      $(toggle).addClass("active");
      $(toggleDot).addClass("active");
    } else {
      $(toggle).removeClass("active");
      $(toggleDot).removeClass("active");
    }
  });

  /****************************
   *
   * UTILITIES
   *
   ****************************/

  // Debounce function
  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Function to format numbers with commas for better readability
  function formatNumberWithCommas(x) {
    // Convert to a number if it's not already one
    const number = parseFloat(x);
    if (isNaN(number)) return x; // Return the original value if conversion fails

    // Use toLocaleString with "en-US" for US-style commas
    return number.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  // Function to update the progress bar of a slider
  function updateProgressBar(slider) {
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    $(slider).css("--progress", `${percentage}%`);
  }

  // Function to update the automate progress bar
  function updateAutomateProgressBar(automateSlider) {
    const value = parseInt(automateSlider.value, 10) || 0;
    const min = parseInt(automateSlider.min, 10) || 0;
    const max = parseInt(automateSlider.max, 10) || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    $(automateSlider).css("--progress", `${percentage.toFixed(0)}%`);
    updateTotalPrice();
  }

  $(".support-tickets_cta").on("click", function () {
    const orders = parseInt($(".support-tickets_input").val(), 10);
    const tickets = Math.round(orders / 15);
    $(".support-tickets_result-value").text(tickets);
    $(".support-tickets_result").css("display", "block");
  });

  // Event listener for changes in the ticketNumber input (with debounce and blur)
  ticketNumber
    .on("input", debounce(handleTicketNumberInput, 1500))
    .on("blur", handleTicketNumberInput);

  function handleTicketNumberInput() {
    let tickets = parseInt($(this).val(), 10);
    if (isNaN(tickets)) {
      console.error("Invalid number of tickets");
      return;
    }

    slider.val(tickets).trigger("input");
    slider.trigger("input");
  }

  // Event listener for changes in the automateNumber input (with debounce and blur)
  automateNumber
    .on("input", debounce(handleAutomateNumberInput, 1500))
    .on("blur", handleAutomateNumberInput);

  function handleAutomateNumberInput() {
    let automateValue = parseInt($(this).val(), 10);
    if (isNaN(automateValue)) {
      console.error("Invalid number of automate tickets");
      return;
    }

    automateSlider.val(automateValue).trigger("input");
    automateSlider.trigger("input");
  }

  /** Function to update total price when any related factor changes */
  function updateTotalPrice() {
    const isAnnual = $('input[name="billingCycle"]:checked').val() === "annual";
    displayTotalPrice(calculateTotalPrice(isAnnual));
  }

  /****************************
   *
   * EVENT LISTENERS
   *
   ****************************/

  $(".full-list-trigger").on("click", function () {
    $(".features_modal-list").addClass("active");
  });

  $(".close-list-trigger").on("click", function () {
    $(".features_modal-list").removeClass("active");
  });

  $(".calculate-trigger").on("click", function () {
    $(".calculate_modal").addClass("active");
  });

  $(".close-calculate-trigger").on("click", function () {
    $(".calculate_modal").removeClass("active");
  });

  $(".active-modal-trigger").on("click", function () {
    $(this).closest(".active").removeClass("active");
  });

  let isProgrammaticClick = false;
  let isFirstClick = true;
  let isFirstTabLink2Click = true; // New flag to track first click on tabLink2
  let hasOtherLinkBeenClicked = false; // Flag to track if any other link has been clicked

  $(helpdeskCTA).on("click", function () {
    isProgrammaticClick = true;
    $(tabLink2).click();
    isProgrammaticClick = false;

    $(automateSummary).css("display", "flex");

    if (isFirstClick) {
      isFirstClick = false;
      const predefinedAutomationRate = 30;
      automateSlider.val(predefinedAutomationRate).trigger("input");
      automateNumber.val(predefinedAutomationRate);

      const newMinValue = 10;
      const rangeStyle = "--progress: 40%";
      automateSlider.attr("style", rangeStyle);
      automateSlider.attr("min", newMinValue);
    }

    updateTotalPrice();
    hasOtherLinkBeenClicked = true;
  });

  $(tabLink2).on("click", function () {
    if (isProgrammaticClick) {
      return;
    }

    $(automateSummary).css("display", "flex");

    const automateValue = parseInt(automateSlider.val(), 10);
    automateSlider.val(automateValue).trigger("input");
    automateNumber.val(automateValue);

    const newMinValue = 10;
    automateSlider.attr("min", newMinValue);

    const minValue = parseInt(automateSlider.attr("min"), 10);
    const maxValue = parseInt(automateSlider.attr("max"), 10);
    const progressPercentage = ((automateValue - minValue) / (maxValue - minValue)) * 100;
    const rangeStyle = `--progress: ${progressPercentage.toFixed(0)}%`;
    automateSlider.attr("style", rangeStyle);

    updateTotalPrice();

    if (isFirstTabLink2Click && !hasOtherLinkBeenClicked) {
      isFirstTabLink2Click = false;
      const predefinedAutomationRate = 30;
      automateSlider.val(predefinedAutomationRate).trigger("input");
      automateNumber.val(predefinedAutomationRate);
      const newMinValue = 10;
      const rangeStyle = "--progress: 40%";
      automateSlider.attr("style", rangeStyle);
      automateSlider.attr("min", newMinValue);
      updateTotalPrice();
    }
  });

  function updateButtonClasses() {
    $('[data-button="action-cta"]').each(function () {
      $(this).removeClass("button-secondary").addClass("button");
    });
  }

  function revertButtonClasses() {
    $('[data-button="action-cta"]').each(function () {
      $(this).removeClass("button").addClass("button-secondary");
    });
  }

  $(automateCTA).on("click", function () {
    $(tabLink3).click();
    updateButtonClasses();
  });

  $(automateSkipCTA).on("click", function () {
    $(tabLink3).click();
    const zeroAutomationRate = 0;
    automateSlider.val(zeroAutomationRate).trigger("input");
    automateNumber.val(zeroAutomationRate);
    const newMinValue = 0;
    automateSlider.attr("min", newMinValue);
    automateSlider.val(newMinValue);
    automatePrice.text("0");
    const maxValue = parseInt(automateSlider.attr("max"), 10);
    const percentageProgress = ((newMinValue - newMinValue) / (maxValue - newMinValue)) * 100;
    const rangeStyle = `--progress: ${percentageProgress}%`;
    automateSlider.attr("style", rangeStyle);
    updateTotalPrice();
    $(automateSummary).css("display", "none");
    updateButtonClasses();
  });

  $(removeAutomate).on("click", function () {
    const zeroAutomationRate = 0;
    automateSlider.val(zeroAutomationRate).trigger("input");
    automateNumber.val(zeroAutomationRate);
    const newMinValue = 10;
    automateSlider.attr("min", newMinValue);
    automateSlider.val(newMinValue);
    automatePrice.text("0");
    const maxValue = parseInt(automateSlider.attr("max"), 10);
    const percentageProgress = ((newMinValue - newMinValue) / (maxValue - newMinValue)) * 100;
    const rangeStyle = `--progress: ${percentageProgress}%`;
    automateSlider.attr("style", rangeStyle);
    updateTotalPrice();
    $(automateSummary).css("display", "none");
    updateButtonClasses();
  });

  $(tabLink1).on("click", function () {
    revertButtonClasses();
  });

  $(tabLink2).on("click", function () {
    revertButtonClasses();
  });

  /****************************
   *
   * FUNCTION TO FIND AND DISPLAY PRICES
   *
   ****************************/

  // Function to find and display the price based on the selected voice tier
  function displaySelectedVoicePrice() {
    const selectedVoice = document.querySelector("#voice-tickets").value;
    const tierVoice = voiceTiers.find((tier) => tier.tier === selectedVoice);
    const voiceDisplay = document.querySelector('[data-price="voice-plan"]');
    const voiceSummary = document.querySelector('[data-summary="voice"]');
    const voicePrice = document.querySelector('[data-price="voice"]');
    const voicePlan = document.querySelector('[data-plan="voice"]');
    const voiceCustomBloc = $(".plan_custom-voice");
    const voicePriceBloc = $(".plan_price-voice");
    const summaryPriceBlock = $(".summary_price-block-voice");
    const summaryPriceCustomVoice = $(".summary_price-custom-voice");
    const summaryPriceEmptyVoice = $(".summary_price-empty-voice");

    $(voiceSummary).css("display", "flex");

    if (tierVoice && selectedVoice !== "Tier 8") {
      voicePlan.textContent = selectedVoice > "Tier 1" ? selectedVoice : " ";
      voiceDisplay.textContent = `${tierVoice.price}`;
      voicePrice.textContent = `${tierVoice.price}`;
      voiceCustomBloc.css("display", "none");
      voicePriceBloc.css("display", "flex");

      if (selectedVoice === "Pay as you go") {
        summaryPriceBlock.css("display", "none");
        summaryPriceCustomVoice.css("display", "none");
        summaryPriceEmptyVoice.css("display", "flex");
        voicePlan.textContent = "Pay as you go";
        voicePriceBloc.css("display", "none");
      } else if (selectedVoice === "Tier 7") {
        summaryPriceEmptyVoice.css("display", "none");
        summaryPriceBlock.css("display", "none");
        summaryPriceCustomVoice.css("display", "flex");
        voicePriceBloc.css("display", "none");
      } else if (selectedVoice === "Tier 0") {
        $(voiceSummary).css("display", "none");
        voicePriceBloc.css("display", "none");
      } else {
        summaryPriceEmptyVoice.css("display", "none");
        summaryPriceBlock.css("display", "flex");
        summaryPriceCustomVoice.css("display", "none");
      }
    } else {
      voicePlan.textContent = selectedVoice;
      voiceCustomBloc.css("display", "flex");
      voicePriceBloc.css("display", "none");
      summaryPriceBlock.css("display", "none");
      summaryPriceCustomVoice.css("display", "none");
      summaryPriceEmptyVoice.css("display", "none");
    }

    updateTotalPrice();
  }

  // Function to find and display the price based on the selected SMS tier
  function displaySelectedSmsPrice() {
    const selectedSMS = document.querySelector("#sms-tickets").value;
    const tierSMS = smsTiers.find((tier) => tier.tier === selectedSMS);
    const smsDisplay = document.querySelector('[data-price="sms-plan"]');
    const smsSummary = document.querySelector('[data-summary="sms"]');
    const smsPrice = document.querySelector('[data-price="sms"]');
    const smsPlan = document.querySelector('[data-plan="sms"]');
    const smsCustomBloc = $(".plan_custom-sms");
    const smsPriceBloc = $(".plan_price-sms");
    const summaryPriceBlock = $(".summary_price-block-sms");
    const summaryPriceCustomSms = $(".summary_price-custom-sms");
    const summaryPriceEmptySms = $(".summary_price-empty-sms");

    $(smsSummary).css("display", "flex");

    if (tierSMS && selectedSMS !== "Tier 8") {
      smsPlan.textContent = selectedSMS > "Tier 1" ? selectedSMS : " ";
      smsDisplay.textContent = `${tierSMS.price}`;
      smsPrice.textContent = `${tierSMS.price}`;
      smsCustomBloc.css("display", "none");
      smsPriceBloc.css("display", "flex");

      if (selectedSMS === "Pay as you go") {
        summaryPriceBlock.css("display", "none");
        summaryPriceCustomSms.css("display", "none");
        summaryPriceEmptySms.css("display", "flex");
        smsPriceBloc.css("display", "none");
        smsPlan.textContent = "Pay as you go";
      } else if (selectedSMS === "Tier 7") {
        summaryPriceEmptySms.css("display", "none");
        summaryPriceBlock.css("display", "none");
        summaryPriceCustomSms.css("display", "flex");
        smsPriceBloc.css("display", "none");
      } else if (selectedSMS === "Tier 0") {
        smsPriceBloc.css("display", "none");
        $(smsSummary).css("display", "none");
      } else {
        summaryPriceEmptySms.css("display", "none");
        summaryPriceBlock.css("display", "flex");
        summaryPriceCustomSms.css("display", "none");
      }
    } else {
      smsPlan.textContent = selectedSMS;
      smsCustomBloc.css("display", "flex");
      smsPriceBloc.css("display", "none");
      summaryPriceBlock.css("display", "none");
      summaryPriceCustomSms.css("display", "none");
      summaryPriceEmptySms.css("display", "none");
    }

    updateTotalPrice();
  }

  /****************************
   *
   * RESET PRICE FUNCTION
   *
   ****************************/

  function resetVoicePrice() {
    const voiceTicketsDropdown = document.querySelector("#voice-tickets");
    voiceTicketsDropdown.value = "Tier 0"; // Set the dropdown to "No Voice Tickets"
    const event = new Event("change");
    voiceTicketsDropdown.dispatchEvent(event);
    $(voiceSummary).css("display", "none");
    updateTotalPrice();
  }

  // Attach the function to the click event of all elements with data-summary="voice-remove"
  const voiceRemoveElements = document.querySelectorAll(
    '[data-summary="voice-remove"]'
  );
  voiceRemoveElements.forEach((element) => {
    element.addEventListener("click", resetVoicePrice);
  });

  // Function to reset the SMS price
  function resetSMSPrice() {
    const smsTicketsDropdown = document.querySelector("#sms-tickets");
    smsTicketsDropdown.value = "Tier 0"; // Set the dropdown to "No SMS Tickets"
    const event = new Event("change");
    smsTicketsDropdown.dispatchEvent(event);
    $('[data-summary="sms"]').css("display", "none");
    updateTotalPrice();
  }

  // Attach the function to the click event of all elements with data-summary="sms-remove"
  const smsRemoveElements = document.querySelectorAll(
    '[data-summary="sms-remove"]'
  );
  smsRemoveElements.forEach((element) => {
    element.addEventListener("click", resetSMSPrice);
  });

  // Handle UI and IDs for dropdown list links on Voice and SMS
  setTimeout(() => {
    document.querySelectorAll(".addons_dropdown-link").forEach(link => {
      processText(link, 'voice-link', 'sms-link');
    });

    function generateValidId(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove invalid characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with a single one
        .trim();
    }

    function processText(element, voiceClass, smsClass) {
      const text = element.textContent.trim();

      if (text.includes("–")) {
        const [part1, part2] = text.split("–").map(part => part.trim());
        element.innerHTML = `<span>${part1}</span> <span>${part2}</span>`;
        const prefix = element.classList.contains(voiceClass) ? "voice-" :
                      element.classList.contains(smsClass) ? "sms-" : "";
        element.id = prefix + generateValidId(part1);
      }
    }

    const dropdownToggle = document.querySelector("#w-dropdown-toggle-14");
    if (dropdownToggle) {
      processText(dropdownToggle, 'voice-ticket', 'sms-ticket');
      const observer = new MutationObserver(() => {
        processText(dropdownToggle, 'voice-ticket', 'sms-ticket');
      });
      observer.observe(dropdownToggle, { childList: true, subtree: true });
    }
  }, 2000); // 2-second delay
})();
