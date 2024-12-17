//hude the shipping price fields using css
const ExtensionCommandType = {
  ReloadCheckout: "EXTENSION:RELOAD_CHECKOUT",
  ShowLoadingIndicator: "EXTENSION:SHOW_LOADING_INDICATOR",
  SetIframeStyle: "EXTENSION:SET_IFRAME_STYLE"
}

checkoutKitLoader.load('extension').then(async function (module) {
  console.log("Checkout loader - extension")
  const params = new URL(document.location).searchParams;
  const extensionId = params.get('extensionId');
  const cartId = params.get('cartId');
  const parentOrigin = params.get('parentOrigin');
  const extensionService = await module.initializeExtensionService({
    extensionId,
    parentOrigin,
    taggedElementId: 'content',
  });


  // reload checkout
  const reloadButton = document.getElementById('reload-checkout');
  reloadButton.addEventListener(
    'click',
    function () {
      console.log('reload checkout');
      extensionService.post({ type: ExtensionCommandType.ReloadCheckout });
    }
  );

  


  extensionService.addListener('EXTENSION:CONSIGNMENTS_CHANGED', async (data) => {

    const priceUpdateNeeded = compareConsignments(data?.payload?.consignments, data?.payload?.previousConsignments);
    if (priceUpdateNeeded) {
      console.log("Consignment updated, need to trigger price update.")
    } else {
      console.log("Key Consignment fields(country, state, shipping option) not updated, no need to trigger price update.")
    }

  });


  function compareConsignments(consignments, previousConsignments) {
    let changed = false;
    consignments.forEach((consignment) => {
      const { id, shippingAddress: { country, stateOrProvinceCode } } = consignment;

      if (previousConsignments.length === 0) {
        changed = true;
      } else {
        const prevConsignment = previousConsignments.find(prev => prev.id === id);
        const newShippingOption = consignment?.selectedShippingOption;
        const newShippingOptionId = newShippingOption?.id;
        const previousCountry = prevConsignment.shippingAddress.country;
        const previousStateOrProvinceCode = prevConsignment.shippingAddress.stateOrProvinceCode;
        const previousShippingOption = prevConsignment?.selectedShippingOption;
        const previousShippingOptionId = previousShippingOption?.id;

        if (country !== previousCountry) {
          console.log(`️🔄 Consignment #${id} shipping country change: ${previousCountry} -> ${country}.`);
          changed = true;
        }
        if (stateOrProvinceCode !== previousStateOrProvinceCode) {
          console.log(`️🔄 Consignment #${id} shipping state change: ${previousStateOrProvinceCode} -> ${stateOrProvinceCode}.`);
          changed = true;
        }
        if (newShippingOptionId !== previousShippingOptionId) {
          console.log(`️🔄 Consignment #${id} shipping option change: ${previousShippingOptionId} -> ${newShippingOptionId}.`);
          console.log(`️🔄 Consignment shipping option name change: ${previousShippingOption?.description} -> ${newShippingOption?.description}.`);
          changed = true;
        }
      }
    });
    return changed;
  }


  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function showLoadingIndicator() {
    extensionService.post({
      type: ExtensionCommandType.ShowLoadingIndicator,
      payload: { show: true },
    });

  }
// show loading indicator
    const loadingIndicatorButton = document.getElementById('show-indicator');
    loadingIndicatorButton.addEventListener(
      'click',
      showLoadingIndicator
    );
  function hideLoadingIndicator() {
    extensionService.post({
      type: ExtensionCommandType.ShowLoadingIndicator,
      payload: { show: false },
    });
  }






});
