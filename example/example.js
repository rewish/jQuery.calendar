jQuery(function($) {

	$('#calendar').calendar({
		// イベントの設定
		events: {
			'2009-11-05': {
				title: 'イベント1'
			},
			'2009-11-15': {
				title: 'イベント2',
				url: 'http://google.co.jp/'
			},
			'2009-11-25': {
				title: 'イベント3'
			}
		}
	});

});
