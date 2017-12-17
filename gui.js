
window.onload = () =>
{
    let repo_link = 'https://github.com/meitarsh/m.s-aluminium-manager-app';
    git.clone(repo_link);
    github.init_canvas();
    github.draw();
};



const github = (function () {
    /*
        canvas
     */
    let canvas = document.createElement('canvas');
    canvas.width = 2600;
    canvas.height = 2000;
    let ctx = canvas.getContext('2d');
    let regions = [];
    /*
        tile size
     */
    let big_box_width = canvas.width / 4;
    let big_box_height = canvas.height;

    const margin = 10;
    const small_box_height = 100;
    /*
        tile colors
     */
    let colors = {};
    colors[0] = 'green'; // working directory
    colors[1] = 'blue'; // staging area
    colors[2] = 'yellow'; // local repository
    colors[3] = 'white'; // remote repository

    const fontBase = 500, fontSize = 13;

    const font_ratio = fontSize / fontBase;
    const font_width = canvas.width * font_ratio; // text displayed on grid with number - what size?
    const font = font_width + "px sans-serif"; // text displayed on grid with number -- what font?
    const font_color = 'black';
    const text_size_limit = 10;
    /*
        line width
     */
    const lines_color = 'black'; // grid border color
    const line_width = '4'; // grid border line width (applied twice in middle borde

    /*
        FPS control
     */
    const fps = 60; // we want 60 fps!
    let request_sync_time_for_fps = 1000 / fps; // divide our second to 60 "mini" render times
    let now;
    let then = Date.now();
    let delta;

    const init_canvas = () =>
    {
        document.body.appendChild(canvas);
        canvas.addEventListener('click',on_click);
    };

    const draw = () =>
    {
        /*
            I mainly did it for terem, but the mechanism is follows
            I save my "last rendered" time
            and if the time difference between NOW and the last I had a call of requestAnimationFrame
            was within the interval needed for my FPS, I will redraw, other case? I won't.
            Shay didn't teach it yet, he taught it to us on advanced part of the course
            but since it was requested, I supported this game with this
            mechanism
         */

        requestAnimationFrame(draw); // request next render time to be called with me
        now = Date.now(); // gets NOW's TIME
        delta = now - then; // gets the difference between the time last call and this call
        // the more "now" is "farther" than "then", the bigger chance for me to render.
        if (delta > request_sync_time_for_fps)
        {
            regions = [];
            clear_screen();
            draw_big_box();
            draw_small_box();
            then = now - (delta & request_sync_time_for_fps); // this time fo syncing to be the difference
            // between now and the "how much I approached to the next" render time
            // e.g:
            // lets say my game renders every 5 seconds, and I want it to render every 3 seconds
            // so RequestAnimationFrame calls the first time on 5 second, in that time I had to "draw"
            // because I passed the 3 second limit I gave myself, though, I also passed 2 of the 3 second
            // to the next render (5-3 = 2), so part of my waiting is done, I should mark it..
        }
    };
    const clear_screen = () => {
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.stroke();
    };

    const draw_big_box = () =>
    {
        ctx.beginPath();
        ctx.lineWidth = line_width;
        ctx.strokeStyle = lines_color;
        let i;
        for (i = 0; i < 4; i++) {
            ctx.rect(i * big_box_width, 0, big_box_width, big_box_height);
            ctx.fillStyle = colors[i];
            const width = parseInt(line_width);
            let computed_x = (i * big_box_width) + width;
            let computed_y = width;
            ctx.fillRect(computed_x, computed_y, big_box_width - (2 * width), big_box_height - (2 * width));
        }
        ctx.stroke();
        ctx.closePath();
    };


    const draw_small_box = () =>
    {
        draw_arr(git.get_working_directory(), 0, l1toString);
        draw_arr(git.get_staging_area(), 1, l1toString);
        draw_arr(git.get_local_repository(), 2, l2toString);
        draw_arr(git.get_remote_repository(), 3, l2toString);
    };

    const draw_arr = (arr, index, toStringfunc) =>
    {
        ctx.beginPath();
        ctx.strokeStyle = font_color;
        ctx.font = font;
        const width = parseInt(line_width);
        let moving_y_index = 3;
        arr.forEach(value =>
        {
            if (ctx.measureText(value.name).width<big_box_width/2)
            {
                const x = (index * big_box_width) + width;
                const y = (moving_y_index * small_box_height) + width + margin;
                const message = toStringfunc(value);
                const id = arr.indexOf(value);
                const id_str = "\n ID: " + id;
                regions.push(get_region(x-width,y-width-20,x+big_box_width-width,y+40-width-margin,id_str+print_everything(value)));
                ctx.strokeText(id + ": " +message, x, y);
                moving_y_index++;
            }
        });
        ctx.stroke();
        ctx.closePath();
    };



    const l1toString = (value) => "Name: " + value.name;//+ " \nSize: " + value.size;
    const l2toString = (value) => "Name: " + value.name;//+ " \nSize: " + value.size + " \nMessage: " + value.message;
    const print_everything = (value) =>
    {
        let str = "";
        str+="\n Name: " + value.name;
        str+="\n Path: " + value.path;
        str+="\n Size: " + value.size;
        if(value.message)
            str+="\n Message: " + value.message;
        return str;
    };

    const get_region = (xmin,ymin,xmax,ymax,file) => {return {xmin,ymin,xmax,ymax,file}};

    const on_click = (event) =>
    {
        const x = event.pageX - canvas.offsetLeft, y = event.pageY - canvas.offsetTop;

        let i;
        for(i=0; i<regions.length;i++)
        {
            let region = regions[i];
            if (y > region.ymin && y < region.ymax
                && x > region.xmin && x < region.xmax)
            {
                alert(region.file);
            }
        }
    };
    return {init_canvas,draw,regions};
}());
