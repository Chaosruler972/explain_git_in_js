

    let git = {};
      /*
          direcotires and repositories 'virtual'
       */
      git.working_directory = [];
      git.staging_area = [];
      git.local_repository = [];
      git.remote_repository = [];


      /*
        github API
       */
      git.github_api_url = 'https://api.github.com';
      git.suffix = '?client_id='+client_id + '&client_secret=' + client_secret;

      /*
        git add simulator
       */
      git.add = (filename = '*') =>
      {
         if(filename === '*')
         {
            git.working_directory.forEach(value =>
            {
                git.stage_file(value);
            });
            git.working_directory=[];
         }
         else
         {
             let element = git.working_directory.find((item,index,arr)=>
             {
                 if(item.name === filename)
                     return true;
                 else
                     return false;
             },filename);

             if(element)
             {
                 git.staging_area.push(element);
                 git.working_directory = git.working_directory.filter(value => value !== element);
             }
             else
             {
                 alert("File not found at all");
             }
         }
      };

       /*
           git add filename...after finding file object
        */
      git.stage_file = (file) =>
      {
          let element = git.staging_area.find((item,index,arr)=>
          {
              if(item.name === file.name)
                  return true;
              else
                  return false;
          },file);

          if(element)
          {
              element.path = file.path;
              element.size = file.size;
          }
          else
          {
            git.staging_area.push(file);
          }
      };

      /*
            git commit simulator
       */
      git.commit = (message) =>
      {
          if(!message)
          {
              alert("You must enter a commit message");
              return;
          }
          git.staging_area.forEach(value =>
          {
              git.commit_file(value,message);
          });
          git.staging_area = [];
      };

      /*
            git commit filename after finding file object
       */
      git.commit_file = (file,message) =>
      {
          let element = git.local_repository.find((item,index,arr)=>
          {
              if(item.name === file.name)
                  return true;
              else
                  return false;
          },file);

          if(element)
          {
              element.path = file.path;
              element.size = file.size;
              element.message = message;
          }
          else
          {
              file.message = message;
              git.local_repository.push(file);
          }
      };

      /*
        git push simulator
       */
      git.push = () =>
      {
          git.local_repository.forEach(value =>
          {
              git.push_file(value);
          });
          git.local_repository = [];
      };

      /*
        git push filename after finding file object
       */
     git.push_file = (file) =>
     {
        let element = git.remote_repository.find((item,index,arr)=>
        {
            if(item.name === file.name)
                return true;
            else
                return false;
        },file);

        if(element)
        {
            element.path = file.path;
            element.size = file.size;
            element.message = file.message;
        }
        else
        {
            git.remote_repository.push(file);
        }
      };

     /*
        git clone simulator, from the real thing!
      */
      git.clone = (link) =>
      {
          git.request_repository_files(link);
      };

      /*
            builds a request link to get JSON from git API containing repo files
       */
      git.request_repository_files = (link) =>
      {
          if(!git.is_valid_url(link))
          {
              alert("Invalid URL");
              return;
          }
          const github_pre = 'https://github.com/';
          let index_of_user = link.indexOf(github_pre);
          if(index_of_user === -1)
          {
              alert("Repo link is not valid");
              return;
          }
          index_of_user+=github_pre.length;
          const user_and_repo = link.substring(index_of_user,link.length);
          const index_of_divider = user_and_repo.indexOf('/');
          if(index_of_divider === -1)
          {
              alert("Repo link is not valid");
              return;
          }
          const user = user_and_repo.substring(0,index_of_divider);
          const repo = user_and_repo.substring(index_of_divider+1,user_and_repo.length);
          if(repo.indexOf('/') !==-1)
          {
              alert("Repo link is not valid");
              return;
          }
          console.log("Loading repo " + repo + " From user " + user);
          let xhr = new XMLHttpRequest();
          xhr.onreadystatechange = () =>
          {
             if(xhr.readyState === 4 && xhr.status === 200)
                 git.get_repository_files(xhr.responseText,user,repo);
          };
          xhr.open('get',git.github_api_url + '/repos/' + user + '/' + repo
              +'/contents/' + git.suffix,true);
          xhr.send(null);
      };

      /*
           from this stage we will move repo files
       */
      git.get_repository_files = (response,user,repo) =>
      {
          let arr = JSON.parse(response);
          git.parse_dir(arr,user,repo);
      };

      /*
        case we got a file
       */
      git.parse_file = (file,user,repo) =>
      {
          let objfile = git.get_file(file.name,file.path,file.size);
          git.working_directory.push(objfile);
          let repo_file = git.get_file(file.name,file.path,file.size);
          repo_file.message = "Previous commit message";
          git.remote_repository.push(repo_file);
      };

      /*
        case we got a directory, recursive call
       */
      git.parse_dir = (directory,user,repo) =>
      {
         directory.forEach(value => {
            if(value.type === 'file')
            {
                git.parse_file(value,user,repo);
            }
            else if(value.type === 'dir')
            {
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () =>
                {
                    if(xhr.readyState === 4 && xhr.status === 200)
                        git.get_repository_files(xhr.responseText,user,repo);
                };
                xhr.open('get',git.github_api_url + '/repos/' + user + '/' + repo
                    +'/contents/' + value.path + git.suffix,true);
                xhr.send(null);
            }
         });
      };

      /*
        checks url is valid
       */
      git.is_valid_url = (link) =>
      {
        const regex = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?'+ // port
            '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
            '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return regex.test(link);
      };

      /*
        pwd, development function
       */
      git.print_working_directory = () =>
      {
        git.working_directory.forEach(value =>
        {
            console.log("Name:" + value.name + "\nPath:" + value.path + "\nSize:" + value.size +"\n\n");
        });
      };
      /*
        gets me the staging area, development function
       */
      git.print_staging_area = () =>
      {
        git.staging_area.forEach(value =>
        {
            console.log("Name:" + value.name + "\nPath:" + value.path + "\nSize:" + value.size +"\n\n");
        });
      };
    /*
         gets me local repository, development function
         */
      git.print_local_repository = () =>
      {
        local_repository.forEach(value =>
        {
            console.log("Name:" + value.name + "\nPath:" + value.path + "\nSize:" + value.size + "\nMessage: " + value.message +  "\n\n");
        });
      };
    /*
          gets me the remote repository, development function
         */
      git.print_remote_repository = () =>
      {
        git.remote_repository.forEach(value =>
        {
            console.log("Name:" + value.name + "\nPath:" + value.path + "\nSize:" + value.size + "\nMessage: " + value.message +  "\n\n");
        });
      };

      /*
        creates a json-object of any file using my parameters
       */
      git.get_file = (filename, path, size) => {return {name:filename,path,size}};

      git.get_working_directory = () => git.working_directory;

      git.get_staging_area = () => git.staging_area;

      git.get_local_repository = () => git.local_repository;

      git.get_remote_repository = () => git.remote_repository;

      /*

      return{get_working_directory,get_staging_area,get_local_repository,get_remote_repository, // repos
          clone,add,commit,push, // commands
          print_working_directory, // testing
          print_staging_area,print_local_repository,print_remote_repository // testing
      };
}());
*/