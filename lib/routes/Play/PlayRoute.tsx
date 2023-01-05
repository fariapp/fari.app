import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { previewContentEditable } from "../../components/ContentEditable/ContentEditable";
import { PageMeta } from "../../components/PageMeta/PageMeta";
import { CharactersContext } from "../../contexts/CharactersContext/CharactersContext";
import { useLogger } from "../../contexts/InjectionsContext/hooks/useLogger";
import { SettingsContext } from "../../contexts/SettingsContext/SettingsContext";
import { useScene } from "../../hooks/useScene/useScene";
import { useTranslate } from "../../hooks/useTranslate/useTranslate";
import {
  RoomEvent,
  Storage,
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useRoom,
  useStorage,
} from "../../liveblocks.config";
import { IMessage, useChat } from "./components/Chat/useChat";
import {
  IPlayersPresenceRef,
  PlayersPresence,
} from "./components/PlayersPresence/PlayersPresence";
import { Session } from "./components/Session/Session";
import {
  useSession,
  useSessionCharacterSheets,
} from "./components/Session/useSession";
import {
  SessionPresenceUpdaterContext,
  useSessionPresenceUpdater,
} from "./contexts/SessionPresenceContext";
import {
  IPlayerInteraction,
  PlayerInteractionFactory,
} from "./types/IPlayerInteraction";

type ConnectionState =
  | "closed"
  | "authenticating"
  | "unavailable"
  | "failed"
  | "open"
  | "connecting";

export function useLiveObject<T>(props: {
  key: keyof Storage;
  value: T;
  isOwner: boolean;
  canBeEmpty?: boolean;
  onChange(newValue: T): void;
}) {
  const liveObject = useStorage((root) => root[props.key]);
  // const [root] = useStorage();

  useEffect(() => {
    console.log("PLAYER: OBJECT CHANGED", liveObject);
    const isSubscriber = !props.isOwner;
    const object = liveObject;
    const objectKeys = Object.keys(object ?? {});
    if (isSubscriber && object) {
      if (props.canBeEmpty || objectKeys.length > 0) {
        props.onChange(object as unknown as T);
      }
    }
  }, [liveObject]);

  const room = useRoom();
  const updateLiveObject = useMutation((root, newState) => {
    /**
     * https://github.com/liveblocks/liveblocks/blob/66eac7d21963d3b35e6a2987b083e2dc9ee5ffbe/packages/liveblocks-react/src/factory.tsx#L83
     */
    const isRoomReady = room.getStorageSnapshot() !== null;

    if (isRoomReady) {
      console.log("GM: UPDATE LIVE OBJECT", newState, root.storage);
      (root.storage.get(props.key) as any).set(newState);
    }
  }, []);

  // useEffect(() => {
  //   if (props.isOwner) {
  //     root?.set(props.key, new LiveObject({}));
  //   }
  // }, [root]);

  useEffect(() => {
    if (props.isOwner) {
      updateLiveObject(props.value as any);
    }
  }, [props.value]);

  return liveObject;
}

function PlayRoute() {
  const params = useParams<{ id: string }>();
  const logger = useLogger();
  const { t } = useTranslate();
  const room = useRoom();
  const settingsManager = useContext(SettingsContext);
  const charactersManager = useContext(CharactersContext);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const idFromParams = params.id;
  const playerName = query.get("name");
  const isGM = !idFromParams;
  const isPlayer = !isGM;
  const userId = settingsManager.state.userId;
  const sessionId = isPlayer ? idFromParams : userId;
  const shareLink = `${window.location.origin}/play/join/${sessionId}`;
  const [connectionState, setConnectionState] = useState<ConnectionState>();
  const [connectionStateSnackBarOpen, setConnectionStateSnackBarOpen] =
    useState(false);

  const sceneManager = useScene();
  const chatManager = useChat();
  const sessionManager = useSession({
    userId: userId,
  });
  const sessionCharactersManager = useSessionCharacterSheets({
    userId: userId,
    charactersManager: charactersManager,
  });

  const sceneName = sceneManager.state.scene?.name ?? "";
  const pageTitle = useMemo(() => {
    return previewContentEditable({ value: sceneName });
  }, [sceneName]);
  const me = sessionManager.computed.me;
  const myCharacter =
    sessionCharactersManager.state.characterSheets[me?.id ?? ""];
  const myCharacterName = myCharacter?.name ?? "";

  const sessionPresenceUpdater = useSessionPresenceUpdater({
    characterName: myCharacterName,
    playerName: me?.playerName,
    color: me?.color,
  });

  useLiveObject({
    key: "session",
    isOwner: isGM,
    value: sessionManager.state.session,
    onChange: (newValue) => {
      sessionManager.actions.overrideSession(newValue);
    },
  });

  useLiveObject({
    key: "chat",
    isOwner: isGM,
    value: chatManager.state.chat,
    onChange: (newValue) => {
      chatManager.actions.overrideChat(newValue);
    },
  });

  useLiveObject({
    key: "scene",
    isOwner: isGM,
    value: sceneManager.state.scene,
    onChange: (newValue) => {
      sceneManager.actions.overrideScene(newValue);
    },
  });

  useLiveObject({
    key: "characters",
    isOwner: isGM,
    canBeEmpty: true,
    value: sessionCharactersManager.state.characterSheets,
    onChange: (newValue) => {
      sessionCharactersManager.actions.overrideCharacterSheets(newValue);
    },
  });

  const broadcast = useBroadcastEvent();

  useEventListener((props) => {
    const event = props.event as unknown as IPlayerInteraction;
    console.log(`Received player interaction: ${event.type}`, event);

    if (event.type === "pause") {
      sessionManager.actions.pause();
    }

    if (event.type === "add-player") {
      sessionManager.actions.addPlayer(event.payload.player);
    }
    if (event.type === "update-player-points") {
      sessionManager.actions.updatePlayerPoints(
        event.payload.id,
        event.payload.points
      );
      sessionCharactersManager.actions.updatePlayerCharacterMainPointCounter(
        event.payload.id,
        event.payload.points,
        event.payload.maxPoints
      );
    }
    if (event.type === "update-player-status") {
      sessionManager.actions.updatePlayerStatus(
        event.payload.id,
        event.payload.status
      );
    }
    if (event.type === "update-player-character") {
      sessionCharactersManager.actions.updatePlayerCharacter(
        event.payload.id,
        event.payload.character
      );
    }
    if (event.type === "update-index-card") {
      sceneManager.actions.updateIndexCard(
        event.payload.indexCard,
        event.payload.indexCardType
      );
    }
    if (event.type === "send-message") {
      chatManager.actions.sendMessage(event.payload.message);
    }
    if (event.type === "ping") {
      broadcast(PlayerInteractionFactory.pong(), {
        shouldQueueEventIfNotReady: true,
      });
    }
  });

  function handlePlayerInteraction(interaction: RoomEvent) {
    console.log(`Sending player interaction: ${interaction.type}`, interaction);
    broadcast(interaction, {
      shouldQueueEventIfNotReady: true,
    });
  }

  useEffect(() => {
    if (playerName) {
      handlePlayerInteraction(
        PlayerInteractionFactory.addPlayer(userId, playerName)
      );
    }
  }, [playerName]);

  useEffect(() => {
    const unsubscribe = room.subscribe("connection", (status) => {
      setConnectionState(status);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setConnectionStateSnackBarOpen(true);
    const timeout = setTimeout(() => {
      setConnectionStateSnackBarOpen(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [connectionState]);

  useEffect(() => {
    if (isGM) {
      logger.track("play_online_game", {
        as: "gm",
      });
    } else {
      logger.track("play_online_game", {
        as: "player",
      });
    }
  }, []);

  function getAlertSevirityColor(connectionState: ConnectionState | undefined) {
    if (connectionState === "closed") {
      return "error";
    }
    if (connectionState === "failed") {
      return "error";
    }
    if (connectionState === "unavailable") {
      return "error";
    }
    if (connectionState === "authenticating") {
      return "info";
    }
    if (connectionState === "connecting") {
      return "info";
    }
    if (connectionState === "open") {
      return "success";
    }
    return "info";
  }

  const playersPresenceRef = useRef<IPlayersPresenceRef>(null);

  return (
    <>
      <PageMeta
        title={pageTitle || t("home-route.play-online.title")}
        description={t("home-route.play-online.description")}
      />
      <>
        <Snackbar
          open={connectionStateSnackBarOpen && !!connectionState}
          autoHideDuration={5000}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Alert severity={getAlertSevirityColor(connectionState)}>
            Connection: {connectionState}
          </Alert>
        </Snackbar>
        <SessionPresenceUpdaterContext.Provider value={sessionPresenceUpdater}>
          <PlayersPresence
            ref={playersPresenceRef}
            onMessageSubmit={(messageToSend) => {
              if (messageToSend) {
                const message = {
                  type: messageToSend.type,
                  fromUserId: userId,
                  value: messageToSend.value,
                } as IMessage;

                if (isGM) {
                  chatManager.actions.sendMessage(message);
                } else {
                  handlePlayerInteraction(
                    PlayerInteractionFactory.sendMessage(message)
                  );
                }
              }
            }}
          />
        </SessionPresenceUpdaterContext.Provider>
        <Session
          chatManager={chatManager}
          sessionManager={sessionManager}
          sessionCharactersManager={sessionCharactersManager}
          sceneManager={sceneManager}
          isLoading={false}
          idFromParams={idFromParams}
          shareLink={shareLink}
          userId={settingsManager.state.userId}
          error={undefined}
          onPlayerInteraction={handlePlayerInteraction}
          onOpenChat={playersPresenceRef.current?.openChat}
        />
      </>
    </>
  );
}

PlayRoute.displayName = "PlayRoute";
export default PlayRoute;
