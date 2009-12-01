jQuery(function($) {

	$('#example').calendar({
		// 初期表示する年
		year: 2009,
		// 初期表示する月
		month: 10,
		// イベントの設定
		events: {
			'2009-10-5': {
				title: '今日はお休み'
			},
			'2009-10-15': {
				title: 'Googleで検索する日',
				url: 'http://google.co.jp/'
			}
		}
	});

	$('#example').calendar();

});
