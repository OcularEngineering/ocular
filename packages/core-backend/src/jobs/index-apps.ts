// const oauthApps = await this.oauthService_.list({organisation_id: org.id})
// const indexer = new IndexerScript({searchIndexClient:this.searchIndexClient_, configModule: this.config_, organisation: org, logger: this.logger_ })
// oauthApps.forEach((oauthApp) => {
//  const service = this.container_[`${oauth.name}AppService`]
//       pipeline(
//         [service.occular(oauth), indexer],
//         (error: NodeJS.ErrnoException | null) => {
//           if (error) {
//             console.error(
//               `Collating documents for ${occularType} failed: ${error}`,
//             );
//             // reject(error);
//           } else {
//             // Signal index pipeline completion!
//             console.log(`Collating documents for ${occularType} succeeded`);
//             // resolve();
//           }
//         },
//       );
//       }
//   )
//  const occularType = oauthApp.type
// })

    //  const occularType = "core-backend"
      //  const occular = await this.oculars[occularType].factory.getOcular(orgs[i]);

      //  console.log(`Collating documents for ${occularType} organisation ${orgs[i].name} via ${this.oculars[occularType].factory.constructor.name}`,);
      
    
    //   this.jobSchedulerService_.create( "Sync Apps Data",
    //     {occularType}, 
    //     "* * * * *", 
    //     async () => {
    //     pipeline(
    //       [occular, indexer],
    //       (error: NodeJS.ErrnoException | null) => {
    //         if (error) {
    //           console.error(
    //             `Collating documents for ${occularType} failed: ${error}`,
    //           );
    //           // reject(error);
    //         } else {
    //           // Signal index pipeline completion!
    //           console.log(`Collating documents for ${occularType} succeeded`);
    //           // resolve();
    //         }
    //       },
    //     );
    //     }
    //   )
    // }

    // Schedule Indexing Batch Jobs For An Organisation
    const syncOrganisationDataFromApps = async () => {
      // Sync Core Ocular Data
      // Schedule Indexing Batch Jobs For Each App in An Organisation
    };