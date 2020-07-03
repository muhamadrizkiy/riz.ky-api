'use strict';

let crypto = require('crypto');
var async = require('async');


module.exports = function(Link) {
  
    let MSG_ERR_EXIST = 'The Link Already Used. Try another link path!'
    let MSG_ERR_NOT_FOUND= 'Cant found the link!'
    let MSG_ERR_LOGIN = 'Authorization Required!'

    let DEFAULT_LINK = 'riz.ky/'

    Link.disableRemoteMethodByName('create'); 
    Link.disableRemoteMethodByName('upsert');
    Link.disableRemoteMethodByName('updateAll');
    Link.disableRemoteMethodByName('prototype.updateAttributes');
    Link.disableRemoteMethodByName('findById');
    Link.disableRemoteMethodByName('findOne');
    Link.disableRemoteMethodByName('exists');
    Link.disableRemoteMethodByName('count');
    Link.disableRemoteMethodByName('replaceOrCreate');
    Link.disableRemoteMethodByName('upsertWithWhere');
    Link.disableRemoteMethodByName('unlink');
    Link.disableRemoteMethodByName('replace');
    Link.disableRemoteMethodByName('replaceById');
    Link.disableRemoteMethodByName('createChangeStream');

    let date = new Date()
    let timestamp = date.toISOString()

    Link.generateLink= function(link, callback) {
       
        var data = {
              linkUrl : link,
              shortedUrl: DEFAULT_LINK + crypto.randomBytes(3).toString("hex"),
              status: "generated"
        }
        Link.create(data, function(err, res){
          if(err) {
            callback(err);
          }
          else {
            let newRes = {
              Link : res
            }
            callback(null, newRes);
          }
        });
          
      }
    
    Link.remoteMethod(
        'generateLink',
        {
          description: 'Enable Link',
          accepts: [
            {arg: "link", type: "string"},
          ],
          returns: {
            arg: 'res', type: 'object', root: true
          },
          http: { path: '/generate', verb: 'post' }
        }
      );


      Link.generateCustomLink= function(link, path, userId, callback) {
        
          var data = {
                linkUrl : link,
                shortedUrl: DEFAULT_LINK + path,
                generated_by: userId,
                status: "generated"
          }
  
          var filter = {
            where: {
                shortedUrl : DEFAULT_LINK + path
            }
          }
  
          Link.findOne(filter).then((checkState) => {
            if(!checkState) {
              Link.create(data, function(err, res){
                if(err) {
                  callback(err);
                }
                else {
                  let newRes = {
                    Link : res
                  }
                  callback(null, newRes);
                }
              });
            }
            else {
              let data = {
                error : true ,
                message : MSG_ERR_EXIST
              }
              callback (null, data);
            }
          })
      };
      
      Link.remoteMethod(
          'generateCustomLink',
          {
            description: 'Enable Link',
            accepts: [
              {arg: "link", type: "string"},
              {arg: "path", type: "string"},
              {arg: "userId", type: "string"},
              
            ],
            returns: {
              arg: 'res', type: 'object', root: true
            },
            http: { path: '/generate/custom', verb: 'post' }
          }
        );


        Link.getLinkByUser= function(user, callback) {
        
          var filter = {
            where: {
                generated_by : user
            }
          }
  
          Link.find(filter).then((result) => {
            if(result) {
              callback(null, result);
            }
            else {
              let data = {
                error : true ,
                message : MSG_ERR_NOT_FOUND
              }
              callback (null, data);
            }
          })
      };
      
      Link.remoteMethod(
          'getLinkByUser',
          {
            description: 'Get Link By User',
            accepts: [
              {arg: "user", type: "string"}
              
            ],
            returns: {
              arg: 'res', type: 'object', root: true
            },
            http: { path: '/getLinkByUser', verb: 'get' }
          }
        );
}