const express = require('express');
const app = express();

app.use(express.json());
if (process.env.NODE_ENV !== 'development'){
  app.use(express.static('public'))
}

// app.get('/test', (req, res)=>{
// 	res.status(200).json({
// 		website: 'My Website',
// 		info: 'Not that much'
// 	})
// })

app.listen(process.env.PORT || 5000)


