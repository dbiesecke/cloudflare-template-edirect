Notes:
-------------

`wrangler generate proxy https://github.com/cloudflare/worker-template-router`



## Dynamic Redirects


* add KV & keyvalue: 

  `wrangler kv:namespace create REDIRECTS`
  
* add REDIRECTS:

  `wrangler kv:key put REDIRECTS test --namespace-id  77c697af949b48c0b898e9c020ef059c   




## Perform regex replacements and inject CSS/JavaScript with Cloudflare Workers 



    addEventListener('fetch', event => {
      event.passThroughOnException()
      event.respondWith(handleRequest(event.request))
    })

    /**
     * Fetch and log a given request object
     * @param {Request} request
     */
    async function handleRequest(request) {
      const response = await fetch(request)
      var html = await response.text()

      // Simple replacement regex
      html = html.replace( /Source Phrase/g , 'Target Phrase')

      // Inject scripts
      const customScripts = '<style type="text/css">body{background:red}</style></body>'
      html = html.replace( /<\/body>/ , customScripts)

      // return modified response
      return new Response(html, {
        headers: response.headers
      }) 
    }




# Links
------------


* [tvly-web](https://github.com/tvly/tvly-web)
* [example-mailinglisthackers-worker.git](https://github.com/signalnerve/mailinglisthackers-worker.git)

* [proxies-on-cloudflare](https://github.com/GitbookIO/proxies-on-cloudflare)
* [wrangler-x86_64-unknown-linux-musl](https://workers.cloudflare.com/get-npm-wrangler-binary/1.17.0/x86_64-unknown-linux-musl)

