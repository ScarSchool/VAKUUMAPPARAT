import { createMuiTheme } from "@material-ui/core";
import { blue, deepOrange, green, grey, red, yellow } from "@material-ui/core/colors";

export default createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 991,
        lg: 1280,
        xl: 1920,
      },
    },
    palette: {
        utility: {
            main: blue[500],
            blue: blue[500],
            avatar: red[500],
            grey: grey[500],
            green: green[500],
            orange: deepOrange[500],
            statistics: yellow[800],
            star: yellow[800],
            likeButton: red[800],
            emptystar: '#BABABA',
            ratingtext: '#666666',
            noContent: grey[500],
            contactAvatar: blue[500],
            status: {
                enrolled: deepOrange[500],
                offeror: blue[500],
                attendee: green[500],
            }

        }
    }
  })