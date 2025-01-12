import {
  Badge,
  Button,
  Card,
  Divider,
  IconButton,
  makeStyles,
  Snackbar,
  Typography,
  withTheme,
} from "@material-ui/core";
import React, { useState } from "react";
import GreenTick from "../GreenTick/GreenTick";
import ThumbsUp from "../../global/assets/icons/thumsup.svg";
import ThumbsDown from "../../global/assets/icons/thumbsdown.svg";
import CopyButton from "../../global/assets/icons/copy.svg";
import { gql, useMutation } from "@apollo/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1.5rem",
  },
  root: {
    minWidth: theme.spacing(37.25),
    boxShadow: "0 0 3px 2px #EEE",
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1.5, 2.0, 0.625),
    background: "linear-gradient(97.93deg, #4452CE 43.88%, #6744CC 109.61%)",
    color: "#fff",
    borderRadius: "5px",
    margin: "4px"
  },
  cardTitle: {
    lineHeight: "23.6px",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    color: "#8F8F8F",
    position: "relative",
  },
  cardFooter: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    background: '#FAFAFA',
    color: "#777",
  },
  thumbsUp: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    marginLeft: theme.spacing(5),
  },
  thumbsDown: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    marginLeft: theme.spacing(2.5),
  },
  downBadge: {
    marginTop: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    color: "#fff",
    backgroundColor: "#ff5656",
  },
  upBadge: {
    marginTop: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    color: "#fff",
    backgroundColor: "#46b33c;",
  },
  blackText: {
    fontSize: "1.1em",
    color: '#111'
  }
}));

const UPVOTE_COUNT = gql`
  mutation($ticketId: String) {
    upvoteTicket(input: { ticketId: $ticketId }) {
      status
      message
    }
  }
`;

const DOWNVOTE_COUNT = gql`
  mutation($ticketId: String) {
    downvoteTicket(input: { ticketId: $ticketId }) {
      status
      message
    }
  }
`;

const SearchResultCard = (props) => {
  const classes = useStyles();
  let {
    title,
    lastVerified,
    phone,
    location,
    details,
    thumbsUpcount,
    theme,
    ticketId,
    resourceType,
    subResourceType,
    state,
    city,
    availability,
    costPerUnit,
  } = props;

  if (thumbsUpcount && !isNaN(thumbsUpcount)) {
    thumbsUpcount = parseInt(thumbsUpcount);
  } else {
    thumbsUpcount = 0;
  }

  const [upvote, setUpvote] = useState(thumbsUpcount);

  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [allowUpvote, setAllowUpvote] = useState(true);
  const [allowDownvote, setAllowDownvote] = useState(true);

  const [upvoteTicket] = useMutation(UPVOTE_COUNT, {
    variables: {
      ticketId,
    },
    update(proxy, result) {
      if (
        result &&
        result.data &&
        result.data.upvoteTicket &&
        result.data.upvoteTicket.status === "200"
      ) {
        setUpvote(upvote + 1);
        setAllowDownvote(true);
        setAllowUpvote(false);
      } else {
        setDialogMessage("Please try again later.");
        setDialogOpen(true);
      }
    },
    onError(err) {
      setDialogMessage("Please try again later.");
      setDialogOpen(true);
    },
  });

  const [downvoteTicket] = useMutation(DOWNVOTE_COUNT, {
    variables: {
      ticketId,
    },
    update(proxy, result) {
      if (
        result &&
        result.data &&
        result.data.downvoteTicket &&
        result.data.downvoteTicket.status === "200"
      ) {
        setUpvote(upvote - 1);
        setAllowDownvote(false);
        setAllowUpvote(true);
      } else {
        setDialogMessage("Please try again later.");
        setDialogOpen(true);
      }
    },
    onError(err) {
      setDialogMessage("Please try again later.");
      setDialogOpen(true);
    },
  });

  const getInfoToCopy = () => {
    const lastVerifiedText = `Last Verified: ${getVerifiedText(lastVerified)}`;
    const phoneNumberText = `Phone Number - ${phone}`;
    const stateText = state ? `State - ${state}` : "";
    const cityText = city ? `City - ${city}` : "";
    const addressText = `Address - ${location}`;
    const detailsText = `Other details - ${details}`;
    const resourceLead = resourceType ? `${resourceType} lead information` : "";

    const copyText = `${resourceLead}
    ${title ? `${title} - ` : ""}
    ${lastVerified ? lastVerifiedText : ""}
    ${phone ? phoneNumberText : ""}
    ${stateText}
    ${cityText}
    ${location ? addressText : ""}
    ${details ? detailsText : ""}
    
    To find more such covid related information leads, visit: ${
      window.location.origin
    }`;

    return copyText;
  };

  const copyInfo = () => {
    const copyText = getInfoToCopy();

    navigator.clipboard.writeText(copyText);
    setDialogMessage("Information Copied to Clipboard");
    setDialogOpen(true);
  };

  const copyLink = () => {
    const copyText = getInfoToCopy();

    if (navigator.share) {
      navigator
        .share({
          title: `${resourceType} Lead`,
          text: copyText,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    }
  };

  const getVerifiedText = (lastVerified) => {
    if (!Number.isNaN(lastVerified)) {
      return dayjs(Number(lastVerified)).fromNow();
    }

    return dayjs(lastVerified).fromNow();
  };

  return (
    <div className={`${classes.container} ${props.className || ""}`}>
      <Card variant="outlined" className={classes.root}>
        <div className={classes.cardHeader}>


          <div className="d-flex flex-row py-2 justify-content-between">

            <div className="d-flex flex-column">
              <Typography style={{ fontSize: "18px" }}>
                {resourceType} / {subResourceType}
              </Typography>
              <div className="d-flex flex-row mt-1">
                <GreenTick />
                <Typography style={{ fontSize: "12px", opacity: 0.7 }}>
                  verified {getVerifiedText(lastVerified)}
                </Typography>
              </div>
              
            </div>

            <div>
              <Button
                style={{ height: "fit-content", textTransform: "capitalize", fontSize:"0.8em" }}
                onClick={() => copyInfo()}
                color="secondary"
                variant="outlined"
              >
                <img src={CopyButton} alt={"Copy"} style={{width: "20px", marginRight: "5px"}} />
                Share
              </Button>
            </div>

          </div>

        </div>

        <div className={classes.cardContent}>
          <div className="d-flex flex-column p-3">

            {title?
              <div className="flex-grow-1 mb-2">
              
              <Typography variant="body2">Name</Typography>
              <Typography variant="body1" className={classes.blackText}>
                {title || '-'}
              </Typography>
            </div>

            : null}
            
            {phone?
              <div className="flex-grow-1 mb-2">
              
                <Typography variant="body2">Phone</Typography>
                <Typography variant="h6">
                  <a href={`tel:${phone}`}>{phone}</a>
                </Typography>
              </div>

            :null}

            {location? 
              <div className="flex-grow-1 mb-2">
              
                <Typography variant="body2">Location</Typography>
                <Typography variant="body1" className={classes.blackText}>
                  {location || '-'}
                </Typography>
              </div>

            :null}


          </div>

          { availability || costPerUnit || details? 
            <Divider className="my-2"/> 
          : null}

          <div className="d-flex flex-row p-3">
            
            {availability? 
          
              <div className="flex-grow-1 mb-2">
                
                <Typography variant="body2">Availability</Typography>
                <Typography variant="body1" className={classes.blackText}>
                  {availability || "-"}
                </Typography>
              </div>
            
            : null}

            {costPerUnit?
              <div className="flex-grow-1 mb-2">
    
                <Typography variant="body2">Cost Per Unit</Typography>
                <Typography variant="body1" className={classes.blackText}>
                  {costPerUnit || "-"}
                </Typography>
  
              </div>
            :null}


          </div>

          {details?
            
            <div className="p-3">
              <Typography variant="body2"
                  >
                    Other Info
                  </Typography>
                  <Typography  variant="body1" className={classes.blackText}>{details || "-"}
                  </Typography>
            </div>

          :null}
          
        </div>
          

        <div className={classes.cardFooter}>
          <div className="d-flex flex-row p-3">
            <Typography style={{ opacity: 0.7, width: "80%", padding: "10px"}} variant="body2">
              Was this helpful?
            </Typography>
          
            <div className="d-flex flex-row">

              <div className={classes.thumbsUp}>
                <IconButton
                  onClick={() => allowUpvote && upvoteTicket()}
                  style={{ background: "#fff", border: "1px solid #ccc" }}
                >
                  <Badge
                    classes={{ badge: classes.upBadge }}
                    badgeContent={upvote > 0 ? upvote : null}
                  >
                    <img src={ThumbsUp} alt={"thumbs up"} style={{width: "20px"}} />
                  </Badge>
                </IconButton>

              </div>
              <div className={classes.thumbsDown}>
                <IconButton
                  onClick={() => allowDownvote && downvoteTicket()}
                  style={{ background: "#fff", border: "1px solid #ccc" }}
                >
                  <Badge
                    classes={{ badge: classes.downBadge }}
                    badgeContent={upvote < 0 ? upvote : null}
                  >
                    <img src={ThumbsDown} alt={"thumbs down"} style={{width: "20px"}} />
                  </Badge>
                </IconButton>

              </div>

            </div>  
          
          </div>
          
        </div>
      </Card>

      {navigator.share && (
        <Button
          onClick={() => copyLink()}
          color="primary"
          variant="outlined"
          style={{ marginTop: theme.spacing(3) }}
        >
          Share
        </Button>
      )}

      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={dialogOpen}
        autoHideDuration={2000}
        onClose={() => setDialogOpen(false)}
        message={dialogMessage}
      />
    </div>
  );
};

export default withTheme(SearchResultCard);
