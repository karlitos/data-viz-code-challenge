# data-viz-code-challenge

The code challenge for the position Software Developer, Data Visualisation

## Data Description
The file [searches.csv](data/searches.csv) contains a random selection of route searches done by users in Berlin on one day.

## Task

Imagine you are a Software Developer at ally and you are presented that data. Your task is to visualise the data in a meaningful way.

##### 1. Visualise the data using Javascript in at least one spatial representation and one non-spatial representation
##### 2. Enrich the visualisation by adding external data
##### 3. Deliver the final representation in a single product


##### Hints:
* You can create a custom Mapbox Style to adapt the basemap to your design scheme
* Deploy your project to a live URL, if possible


## Developing your solution:

1. Please clone the repository to your local machine via:

    ```
    git clone https://github.com/allyapp/data-viz-code-challenge.git
    ```

    or download a zip archive of this repository [here](https://github.com/allyapp/data-viz-code-challenge/archive/master.zip).

    **Important:** Do not fork this repository. Doing so will expose your solution
   to other candidates!

2. Fulfill the given task.

3. Submit your solution:

    Please submit your solutions in a form of publicly accessible git repository. Please make sure to submit the full git commit history with the project. We will clone it and evaluate your work so. Please include instructions for testing and running your code.

    Alternatively, you can submit a zip archive of your project via email.

# Notes on the solution

I decided to use _LeafletJs_ for the visualization of the underlaying map.One reason for this decision was, that no API key was needed  compared to the _Mapbox_ which either built upon the _Leaflet_ library. There were also some good examples of connecting _D3_ with _Leaflet_.

There are basically two method of using d3 to plot SVG artefacts on top of a Leaflet map:
1. Appending a new SVG element on Leaflet's "overlay pane"
2. Implementing a custom vector tile layer that hooks in to Leaflets native tile layer ecosystem

I decided to go with the second solution, because it would me allow to work more D3-centric without the necessity of proper conversion of the provided data to GeoJSON. In this case one has to take care about the zooming and translation effects personally, but this would also allow more flexibility in the implementation of the visualization.

Very good lecture on the different approaches offers [this dicsuccion][Achieving animated zoom with d3 and Leaflet]

## Visualization
The origin- and destination-points of the searches are displayed as circles of different colors, so it can be distinguished which one of them it is. The coordinates are connected with a line, the line has a color gradient respective to the colors of the origin/destination.

The size of the circles and the stroke-width of the lines changes also accordingly to the zoom-level of the map. Different size-computations are used for zoom-level greater/lower zoom-level 12 for better visibility. Of course one could use different size computation methods for every zoom level, this would require some testing to get a feeling how the circles/lines looks like in different zoom-levels and sizes.

The time-scale at the bottom represent all the searches over time. The upper part allow some mouseover-effect displaying tooltip, the lower part allows selection of a region/perdio which changes the displayed connections. The division in two part was necessary, because the selection-brush grabs the mouse event.

It was necessary to use two gradients for coloring the connections, one going top-down and the other for the other direction. Corresponding gradient is used depending whether the connection goes north-south or opposite, so that the start/end color of the gradient corresponds to the origin/destination color.

The map is centered around the mean of difference between the maximal and minimal latitude/longitude. I can imagine than some more "clever" computation could be used for that, to avoid distortion due to the outliers - for example mean of the max/min value lying in the 30%-width interval around the median ...

## Conclusion

I am quite happy with the result, the performance was overall good on my machine, the time-scale display nicely the difference in the search-frequency during the time, the connection lines gives a feeling about the distances between origin-destination of the searches and the points shows spatial distribution of the search origins/destinations. The selection of different periods allow filtering of the displayed data and still behaves very snappy and performant. The visualization is created fully automatic according to the given data and can be re-used for other data sets.

It would be probably good idea to put some of the definition in separate configuration file and also rely more on external css for styling of the SVG elements. Other improvement could be a selector allowing displaying/dismissing of the origin/destination circles and the connection lines.


[Achieving animated zoom with d3 and Leaflet]: http://www.unknownerror.org/opensource/Leaflet/Leaflet/q/stackoverflow/21216347/achieving-animated-zoom-with-d3-and-leaflet