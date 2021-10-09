$(document).ready(function() {
   
    // document.addEventListener('DOMContentLoaded', function() {
    //     new Zooming({
    //     }).listen('.img-zoomable')
    // })
    $(".select2").select2({minimumResultsForSearch: -1})
    new Zooming({bgColor: 'rgb(0,0,0)'}).listen('.img-zoomable')
    
     var currentDataImage = $('#lightSlider li');
     var currentImage = $('#lightSlider li img');
     var currentImageSrc = $('#lightSlider li img').attr('src');
        
    var imgElements = $('#lightSlider li img');
    var imgLi = $('#lightSlider li');
    var img, url, imageli;
     

    for (var i = 0; i < imgElements.length; i++) {   
        img = imgElements[i];
        console.log(img.src); //already get src of img tag
       // $('ul#lightSlider li').attr('data-thumb', img.src);
       
        //for(var j = 0;j < imgLi.length; j++){
            //console.log(j);
            imageli = imgLi[i];
            console.log(imageli);
            var sam = imageli.getAttribute('data-thumb');
            imageli.setAttribute('data-thumb', img.src);
            //console.log(sam);
            //imageli.attr('data-thumb', img.src)
        //}
    }
    $('.btn-join').on('click', function(e){
        e.preventDefault();
        var id = $(this).attr('data-id');
        var url = $(this).attr('data-url')
        // window.location.href = "/shop/payment/" + id;
        window.location.href = "/shop/payment/" + url;
    })
    var url = (window.location).href;
    var res = url.split("/").pop();

    var $carousel = 
    $('#lightSlider').slick({
        dots: false,
        arrows: false,
        swipeToSlide: true,
        infinite: false,
        adaptiveHeight: true,
        draggable: false,

    });
    $('.2nd-slick').slick({
      slidesToShow: 9,
      slidesToScroll: 1,
      asNavFor: '#lightSlider',
      dots: false,
      adaptiveHeight: true,
      focusOnSelect: true,
    });
    //  $('#product-slider').lightSlider({
    //   gallery:true,
    //   item:1,
    //   vertical:true,
    //   verticalHeight:295,
    //   vThumbWidth:50,
    //   thumbItem:8,
    //   thumbMargin:4,
    //   slideMargin:0,
    //   currentPagerPosition:''
    // });  
     
    




    var select = $("#c-profile");
    var selectQuantity = $("#c-profile > option")
    $("#c-profile").change( function(e) {
        goTo = select.val();
        $carousel.slick( "goTo", goTo );
      }); 

    fetch('/api/product/getcid/' + res).then(function(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    }).then(function(responseAsJson) {
        console.log(responseAsJson);
        var product = responseAsJson;

        $('#c-profile').change(function() {
            // $('.product-details-price span').remove();
            for (var i in product) {
                if (this.value == product[i].product_id) {
                    if (product[i].outstock == 1) {
                        $('.product-details-price').html("$" + product[i].price + " USD")
                        // $("#btn-add, #btn-paypal").attr("disabled", false)
                        // $("#btn-paypal").attr("disabled", false)
                    } else {
                        $('.product-details-price').html("<span style='color: red'>Out stock</span>")

                        // $("#btn-add").attr("disabled", true)
                        // $("#btn-paypal").attr("disabled", true)
                    }

                }


            }
            // if(this.value == product[i].product_id){
            //     console.log(product[i].product_id)
            // }
        })
    })


    fetch('/api/category/getcid/' + res).then(function(response2nd) {
        if (!response2nd.ok) {
            throw Error(response2nd.statusText);
        }
        return response2nd.json();
    }).then(function(response2ndAsJson) {
        var category = response2ndAsJson;
        var status = category.status_gb;
        if(status == 0 || status == 1){
            $("#btn-add, #btn-paypal").attr("disabled", true)
        }else{

        }

    })
})