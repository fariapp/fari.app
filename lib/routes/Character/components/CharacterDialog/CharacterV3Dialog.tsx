import { css } from "@emotion/css";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import Link from "@material-ui/core/Link";
import Snackbar from "@material-ui/core/Snackbar";
import useTheme from "@material-ui/core/styles/useTheme";
import Switch from "@material-ui/core/Switch";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import PrintIcon from "@material-ui/icons/Print";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import UndoIcon from "@material-ui/icons/Undo";
import Alert from "@material-ui/lab/Alert";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import TabContext from "@material-ui/lab/TabContext";
import TabPanel from "@material-ui/lab/TabPanel";
import React, { useContext, useState } from "react";
import { Prompt } from "react-router";
import { ContentEditable } from "../../../../components/ContentEditable/ContentEditable";
import { FateLabel } from "../../../../components/FateLabel/FateLabel";
import { CharacterCard } from "../../../../components/Scene/components/PlayerRow/CharacterCard/CharacterCard";
import { SlideUpTransition } from "../../../../components/SlideUpTransition/SlideUpTransition";
import { CharactersContext } from "../../../../contexts/CharactersContext/CharactersContext";
import { useLogger } from "../../../../contexts/InjectionsContext/hooks/useLogger";
import {
  CharacterSheetTypes,
  CharacterType,
} from "../../../../domains/character/CharacterType";
import {
  BlockType,
  IBlock,
  ICharacter,
  IPage,
  ISection,
  Position,
} from "../../../../domains/character/types";
import { getDayJSFrom } from "../../../../domains/dayjs/getDayJS";
import {
  IDiceCommandNames,
  IDiceRollWithBonus,
  IRollDiceOptions,
} from "../../../../domains/dice/Dice";
import { useQuery } from "../../../../hooks/useQuery/useQuery";
import { useTextColors } from "../../../../hooks/useTextColors/useTextColors";
import { useTranslate } from "../../../../hooks/useTranslate/useTranslate";
import { IPossibleTranslationKeys } from "../../../../services/internationalization/IPossibleTranslationKeys";
import { useCharacter } from "../../hooks/useCharacter";
import { BetterDnd } from "../BetterDnD/BetterDnd";
import { AddBlock } from "./components/AddBlock";
import { AddSection } from "./components/AddSection";
import {
  BlockDicePool,
  BlockDicePoolActions,
  IDicePool,
  IDicePoolElement,
} from "./components/blocks/BlockDicePool";
import {
  BlockPointCounter,
  BlockPointCounterActions,
} from "./components/blocks/BlockPointCounter";
import { BlockRichText } from "./components/blocks/BlockRichText";
import { BlockSkill, BlockSkillActions } from "./components/blocks/BlockSkill";
import { BlockSlotTracker } from "./components/blocks/BlockSlotTracker";
import { BlockText, BlockTextActions } from "./components/blocks/BlockText";
import { SheetHeader } from "./components/SheetHeader";

export const smallIconButtonStyle = css({
  label: "CharacterDialog-small-icon-button",
  padding: "0",
});

const HeaderHelpLinks: Record<string, string> = {
  "Aspects": "/srds/condensed/getting-started?goTo=aspects",
  "Stunts & Extras": "/srds/condensed/getting-started?goTo=stunts",
  "Refresh": "/srds/condensed/getting-started?goTo=refresh",
  "Stress": "/srds/condensed/challenges-conflicts-and-contests?goTo=stress",
  "Consequences":
    "/srds/condensed/challenges-conflicts-and-contests?goTo=consequences-1",
  "Skills": "/srds/condensed/getting-started?goTo=skill-list",
  "Dice":
    "/srds/condensed/taking-action-rolling-the-dice?goTo=taking-action-rolling-the-dice",
};

export const CharacterV3Dialog: React.FC<{
  open: boolean;
  character: ICharacter | undefined;
  readonly?: boolean;
  dialog: boolean;
  pool: IDicePool;
  rolls: Array<IDiceRollWithBonus>;
  onSkillClick(
    options: IRollDiceOptions,
    commands: Array<IDiceCommandNames> | undefined
  ): void;
  onPoolClick(element: IDicePoolElement): void;
  onClose?(): void;
  onSave?(newCharacter: ICharacter): void;
}> = (props) => {
  const { t } = useTranslate();
  const theme = useTheme();
  const query = useQuery<"card">();
  const showCharacterCard = query.get("card") === "true";
  const logger = useLogger();
  const characterManager = useCharacter(props.character);
  const [editing, setEditing] = useState(false);
  const [savedSnack, setSavedSnack] = useState(false);
  const charactersManager = useContext(CharactersContext);
  const date = getDayJSFrom(characterManager.state.character?.lastUpdated);

  const headerBackgroundColors = useTextColors(theme.palette.background.paper);

  const [tab, setTab] = useState<string>("0");
  const currentPageIndex = parseInt(tab);

  function onSave() {
    const updatedCharacter = characterManager.actions.sanitizeCharacter();
    props.onSave?.(updatedCharacter!);
    setSavedSnack(true);
    logger.info(`CharacterDialog:onSave`);
  }

  function handleOnToggleEditing() {
    setEditing((prev) => !prev);
    logger.info(`CharacterDialog:onToggleAdvanced`);
  }

  function onLoadTemplate(newTemplate: CharacterType) {
    const confirmed = confirm(t("character-dialog.load-template-confirmation"));

    if (confirmed) {
      characterManager.actions.loadTemplate(newTemplate);
      setEditing(false);
      logger.info(
        `CharacterDialog:onLoadTemplate:${CharacterType[newTemplate]}`
      );
    }
  }

  function onClose() {
    if (characterManager.state.dirty && !props.readonly) {
      const confirmed = confirm(t("character-dialog.close-confirmation"));
      if (confirmed) {
        props.onClose?.();
        setEditing(false);
      }
    } else {
      props.onClose?.();
      setEditing(false);
    }
  }

  const sheetContentStyle = css({
    label: "CharacterDialog-sheet-content",
    width: "100%",
    padding: ".5rem 1rem",
  });

  if (!characterManager.state.character) {
    return null;
  }

  return (
    <>
      <Prompt
        when={characterManager.state.dirty}
        message={t("manager.leave-without-saving")}
      />
      <Snackbar
        open={savedSnack}
        autoHideDuration={2000}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setSavedSnack(false);
        }}
      >
        <Alert
          severity="success"
          onClose={() => {
            setSavedSnack(false);
          }}
        >
          {t("character-dialog.saved")}
        </Alert>
      </Snackbar>
      {renderDialog()}
    </>
  );

  function renderDialog() {
    if (props.dialog && characterManager.state.character) {
      return (
        <Dialog
          open={props.open}
          fullWidth
          keepMounted
          maxWidth="md"
          scroll="paper"
          onClose={onClose}
          TransitionComponent={SlideUpTransition}
        >
          <DialogTitle
            className={css({
              label: "CharacterDialog-dialog-wrapper",
              padding: "0",
            })}
          >
            <Container maxWidth="md">
              <Box className={sheetContentStyle}>{renderNameAndGroup()}</Box>
            </Container>
          </DialogTitle>
          <DialogContent
            className={css({
              label: "CharacterDialog-dialog-wrapper",
              padding: "0",
            })}
            dividers
          >
            <Container maxWidth="md">
              <Box>{renderPages(characterManager.state.character.pages)}</Box>
            </Container>
          </DialogContent>
          <DialogActions
            className={css({
              label: "CharacterDialog-dialog-wrapper",
              padding: "0",
            })}
          >
            <Container maxWidth="md">
              <Box className={sheetContentStyle}>{renderTopLevelActions()}</Box>
            </Container>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Container maxWidth="md">
        <Box className={sheetContentStyle}>{renderTopLevelActions()}</Box>
        <Box className={sheetContentStyle}>{renderManagementActions()}</Box>
        <Box className={sheetContentStyle}>{renderNameAndGroup()}</Box>
        <Box>{renderPages(characterManager.state.character?.pages)}</Box>
      </Container>
    );
  }

  function renderManagementActions() {
    return (
      <Collapse in={editing}>
        <Box>
          <Grid
            container
            wrap="nowrap"
            spacing={2}
            justify="flex-start"
            alignItems="center"
          >
            <Grid item>
              <InputLabel> {t("character-dialog.load-template")}</InputLabel>
            </Grid>
            <Grid item>
              <Autocomplete
                size="small"
                autoHighlight
                filterOptions={createFilterOptions({ limit: 100 })}
                options={CharacterSheetTypes}
                className={css({ width: "300px" })}
                getOptionLabel={(option) =>
                  t(
                    `character-dialog.template.${option.type}` as IPossibleTranslationKeys
                  )
                }
                groupBy={(option) => option.group}
                onChange={(event, newValue) => {
                  if (newValue?.type) {
                    onLoadTemplate(newValue?.type);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Template" variant="outlined" />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    );
  }

  function renderPages(pages: Array<IPage> | undefined) {
    if (!pages) {
      return null;
    }
    return (
      <Box>
        <Box mb="1rem">
          <Grid container alignItems="center" wrap="nowrap" justify="center">
            <Grid item xs={10}>
              <Tabs
                value={tab}
                variant="scrollable"
                scrollButtons="auto"
                classes={{
                  root: css({
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }),
                  indicator: css({
                    background: theme.palette.primary.main,
                  }),
                }}
                onChange={(e, newValue) => {
                  setTab(newValue);
                }}
              >
                {pages?.map((page, pageIndex) => {
                  return (
                    <Tab
                      disableRipple
                      key={page.id}
                      value={pageIndex.toString()}
                      label={
                        <ContentEditable
                          clickable
                          value={page.label}
                          readonly={!editing}
                          border={editing}
                          onChange={(newValue) => {
                            characterManager.actions.renamePage(
                              pageIndex,
                              newValue
                            );
                          }}
                        />
                      }
                    />
                  );
                })}
              </Tabs>
            </Grid>
            {editing && (
              <Grid item>
                <IconButton
                  onClick={() => {
                    characterManager.actions.addPage(currentPageIndex);
                    const newTab =
                      characterManager.state.character?.pages.length ?? 0;
                    setTab(newTab.toString());
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Box>
        <Collapse in={editing}>
          <Box mb=".5rem">
            <Grid container justify="space-around" alignItems="center">
              <Grid item>
                <IconButton
                  disabled={currentPageIndex === 0}
                  onClick={() => {
                    characterManager.actions.movePage(currentPageIndex, "up");
                    setTab((currentPageIndex - 1).toString());
                  }}
                >
                  <UndoIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  disabled={
                    characterManager.state.character?.pages.length === 1
                  }
                  onClick={() => {
                    const confirmed = confirm(
                      // TODO text
                      "Are you sure you want to remove that page"
                    );
                    if (confirmed) {
                      characterManager.actions.removePage(currentPageIndex);
                    }
                    setTab("0");
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  disabled={currentPageIndex === pages?.length - 1}
                  onClick={() => {
                    characterManager.actions.movePage(currentPageIndex, "down");
                    setTab((currentPageIndex + 1).toString());
                  }}
                >
                  <RedoIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        <TabContext value={tab}>
          {pages?.map((page, pageIndex) => {
            const sectionStyle = css({
              label: "CharacterDialog-grid-section",
              borderTop: `2px solid ${headerBackgroundColors.primary}`,
              borderLeft: `2px solid ${headerBackgroundColors.primary}`,
              borderRight: `2px solid ${headerBackgroundColors.primary}`,
              borderBottom: `2px solid ${headerBackgroundColors.primary}`,
            });
            return (
              <TabPanel
                key={page.id}
                value={pageIndex.toString()}
                className={css({
                  label: "CharacterDialog-tab-panel",
                  padding: "0",
                })}
              >
                <Box position="relative" mb="3rem">
                  <Grid container>
                    <Grid item xs={12} md={6} className={sectionStyle}>
                      {renderSections(pageIndex, page.sections, Position.Left)}
                    </Grid>
                    <Grid item xs={12} md={6} className={sectionStyle}>
                      {renderSections(pageIndex, page.sections, Position.Right)}
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            );
          })}
        </TabContext>

        <Grid container justify="center">
          <Grid item>
            <Box pt=".5rem">
              <Typography>{date.format("lll")}</Typography>
            </Box>
          </Grid>
        </Grid>
        {showCharacterCard && (
          <Grid container justify="center">
            <Grid item xs>
              <Box pt=".5rem" ml="-.5rem">
                <CharacterCard
                  isMe={false}
                  playerName="..."
                  width="350px"
                  readonly={false}
                  characterSheet={characterManager.state.character}
                  onCharacterDialogOpen={() => undefined}
                  onRoll={() => undefined}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }

  function renderSections(
    pageIndex: number,
    sections: Array<ISection> | undefined,
    position: Position
  ) {
    const numberOfSections =
      sections?.filter((s) => s.position === position).length ?? 0;
    const shouldRenderAddSectionButton = editing && numberOfSections === 0;

    return (
      <>
        <Box py={numberOfSections === 0 ? "1rem" : undefined}>
          {sections?.map((section, sectionIndex) => {
            if (section.position !== position) {
              return null;
            }

            const helpLink = HeaderHelpLinks[section.label];

            return (
              <Box key={section.id}>
                <SheetHeader
                  label={section.label}
                  currentPageIndex={currentPageIndex}
                  pages={characterManager.state.character?.pages}
                  position={section.position}
                  helpLink={helpLink}
                  editing={editing}
                  visibleOnCard={section.visibleOnCard}
                  onReposition={(newPosition) => {
                    characterManager.actions.repositionSection(
                      pageIndex,
                      sectionIndex,
                      newPosition
                    );
                  }}
                  onMoveToPage={(newPageIndex) => {
                    characterManager.actions.moveSectionInPage(
                      pageIndex,
                      sectionIndex,
                      newPageIndex
                    );
                  }}
                  onToggleVisibleOnCard={() => {
                    characterManager.actions.toggleSectionVisibleOnCard(
                      pageIndex,
                      sectionIndex
                    );
                  }}
                  onLabelChange={(newLabel) => {
                    characterManager.actions.renameSection(
                      pageIndex,
                      sectionIndex,
                      newLabel
                    );
                  }}
                  onMoveDown={() => {
                    characterManager.actions.moveSection(
                      pageIndex,
                      sectionIndex,
                      "down"
                    );
                  }}
                  onMoveUp={() => {
                    characterManager.actions.moveSection(
                      pageIndex,
                      sectionIndex,
                      "up"
                    );
                  }}
                  onRemove={() => {
                    const confirmed = confirm(
                      // TODO text
                      "Are you sure you want to remove that section"
                    );
                    if (confirmed) {
                      characterManager.actions.removeSection(
                        pageIndex,
                        sectionIndex
                      );
                    }
                  }}
                />
                {renderSectionBlocks(pageIndex, sectionIndex, section)}

                <Collapse in={editing}>
                  <Box p=".5rem" mb=".5rem">
                    <Grid container justify="center" alignItems="center">
                      <Grid item>
                        <AddBlock
                          onAddBlock={(blockType) => {
                            characterManager.actions.addBlock(
                              pageIndex,
                              sectionIndex,
                              blockType
                            );
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <AddSection
                          onAddSection={() => {
                            characterManager.actions.addSection(
                              pageIndex,
                              sectionIndex,
                              position
                            );
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            );
          })}

          {shouldRenderAddSectionButton && (
            <Box>
              <AddSection
                onAddSection={() => {
                  characterManager.actions.addSection(pageIndex, 0, position);
                }}
              />
            </Box>
          )}
        </Box>
      </>
    );
  }

  function renderTopLevelActions() {
    if (props.readonly || !props.onSave) {
      return null;
    }

    return (
      <>
        <Grid
          container
          wrap="nowrap"
          spacing={2}
          justify="space-between"
          alignItems="center"
        >
          {!props.readonly && (
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                label="Advanced Mode"
                control={
                  <Switch
                    color="primary"
                    checked={editing}
                    onChange={handleOnToggleEditing}
                  />
                }
              />
            </Grid>
          )}

          <Grid
            item
            xs={12}
            sm={6}
            container
            alignItems="center"
            justify="flex-end"
            spacing={2}
          >
            <Grid item>
              <IconButton
                color="default"
                data-cy="character-dialog.print"
                size="small"
                onClick={() => {
                  window.open(`/characters/${props.character?.id}/print`);
                }}
              >
                <PrintIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <Button
                color="primary"
                data-cy="character-dialog.save"
                data-cy-dirty={characterManager.state.dirty}
                variant={
                  characterManager.state.dirty ? "contained" : "outlined"
                }
                type="submit"
                endIcon={<SaveIcon />}
                onClick={onSave}
              >
                {t("character-dialog.save")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid container wrap="nowrap" spacing={2} justify="flex-end" />
      </>
    );
  }

  function renderNameAndGroup() {
    return (
      <>
        <Box mb="1rem">
          <Grid container>
            <Grid
              item
              container
              sm={12}
              md={6}
              spacing={2}
              alignItems="flex-end"
            >
              <Grid
                item
                className={css({
                  label: "CharacterDialog-name",
                  flex: "0 0 auto",
                })}
              >
                <FateLabel>{t("character-dialog.name")}</FateLabel>
              </Grid>
              <Grid item xs>
                <Box fontSize="1rem">
                  <ContentEditable
                    border
                    autoFocus
                    data-cy="character-dialog.name"
                    readonly={props.readonly}
                    value={characterManager.state.character!.name}
                    onChange={(value) => {
                      characterManager.actions.setName(value);
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid
              item
              container
              sm={12}
              md={6}
              spacing={2}
              alignItems="flex-end"
            >
              <Grid
                item
                className={css({
                  label: "CharacterDialog-group",
                  flex: "0 0 auto",
                })}
              >
                <FateLabel>{t("character-dialog.group")}</FateLabel>
              </Grid>
              <Grid item xs>
                <Autocomplete
                  freeSolo
                  options={charactersManager.state.groups.filter((g) => {
                    const currentGroup =
                      characterManager.state.character!.group?.toLowerCase() ??
                      "";
                    return g.toLowerCase().includes(currentGroup);
                  })}
                  value={characterManager.state.character!.group ?? ""}
                  onChange={(event, newValue) => {
                    characterManager.actions.setGroup(newValue);
                  }}
                  inputValue={characterManager.state.character!.group ?? ""}
                  onInputChange={(event, newInputValue) => {
                    characterManager.actions.setGroup(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                      }}
                      data-cy={`character-dialog.group`}
                      disabled={props.readonly}
                      className={css({
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      })}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {props.dialog && (
              <IconButton
                size="small"
                data-cy="character-dialog.close"
                className={css({
                  label: "CharacterDialog-dialog-close",
                  position: "absolute",
                  padding: ".5rem",
                  top: ".5rem",
                  right: ".5rem",
                })}
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Grid>
        </Box>
      </>
    );
  }

  function renderSectionBlocks(
    pageIndex: number,
    sectionIndex: number,
    section: ISection
  ) {
    return (
      <>
        <Box
          className={css({
            label: "CharacterDialog-sections",
            marginTop: section.blocks.length === 0 ? "2rem" : ".5rem",
            marginBottom: section.blocks.length === 0 ? "2rem" : ".5rem",
          })}
        >
          {section.blocks.map((block, blockIndex) => {
            return (
              <Box key={block.id}>
                <BetterDnd
                  index={blockIndex}
                  type={section.label}
                  readonly={!editing}
                  className={css({
                    label: "CharacterDialog-block-dnd",
                    marginLeft: ".5rem",
                    marginRight: ".5rem",
                  })}
                  dragIndicatorClassName={css({
                    label: "CharacterDialog-block-dnd-drag",
                    marginTop: ".5rem",
                  })}
                  onMove={(dragIndex, hoverIndex) => {
                    characterManager.actions.moveDnDBlock(
                      pageIndex,
                      sectionIndex,
                      dragIndex,
                      hoverIndex
                    );
                  }}
                >
                  <Box
                    className={css({
                      label: "CharacterDialog-block",
                      marginTop: ".2rem",
                      marginBottom: ".2rem",
                      marginLeft: ".5rem",
                      marginRight: ".5rem",
                    })}
                  >
                    {block.type === BlockType.Text && (
                      <BlockText
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                      />
                    )}
                    {block.type === BlockType.RichText && (
                      <BlockRichText
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                      />
                    )}
                    {block.type === BlockType.Skill && (
                      <BlockSkill
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                        onSkillClick={(options, commands) => {
                          props.onSkillClick(options, commands);
                        }}
                      />
                    )}
                    {block.type === BlockType.DicePool && (
                      <BlockDicePool
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                        pool={props.pool}
                        onPoolClick={(element) => {
                          props.onPoolClick(element);
                        }}
                      />
                    )}
                    {block.type === BlockType.PointCounter && (
                      <BlockPointCounter
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                      />
                    )}

                    {block.type === BlockType.SlotTracker && (
                      <BlockSlotTracker
                        editing={editing}
                        readonly={props.readonly}
                        pageIndex={pageIndex}
                        sectionIndex={sectionIndex}
                        section={section}
                        block={block}
                        blockIndex={blockIndex}
                        onLabelChange={(value) => {
                          characterManager.actions.setBlockLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onValueChange={(value) => {
                          characterManager.actions.setBlockValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            value
                          );
                        }}
                        onMetaChange={(meta) => {
                          characterManager.actions.setBlockMeta(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            meta
                          );
                        }}
                        onAddBox={() => {
                          characterManager.actions.addBlockBox(
                            pageIndex,
                            sectionIndex,
                            blockIndex
                          );
                        }}
                        onRemoveBox={() => {
                          characterManager.actions.removeBlockBox(
                            pageIndex,
                            sectionIndex,
                            blockIndex
                          );
                        }}
                        onToggleBox={(boxIndex) => {
                          characterManager.actions.toggleCheckboxFieldValue(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            boxIndex
                          );
                        }}
                        onBoxLabelChange={(boxIndex, value) => {
                          characterManager.actions.setBlockBoxLabel(
                            pageIndex,
                            sectionIndex,
                            blockIndex,
                            boxIndex,
                            value
                          );
                        }}
                      />
                    )}
                    <Collapse in={editing}>
                      {renderBlockAdvancedOptions(
                        pageIndex,
                        sectionIndex,
                        section,
                        block,
                        blockIndex
                      )}
                    </Collapse>
                  </Box>
                </BetterDnd>
              </Box>
            );
          })}
        </Box>
      </>
    );
  }

  function renderBlockAdvancedOptions(
    pageIndex: number,
    sectionIndex: number,
    section: ISection,
    block: IBlock,
    blockIndex: number
  ) {
    return (
      <Grid container justify="flex-end" spacing={1}>
        {block.type === BlockType.PointCounter && (
          <BlockPointCounterActions
            pageIndex={pageIndex}
            sectionIndex={sectionIndex}
            section={section}
            block={block}
            blockIndex={blockIndex}
            onMetaChange={(meta) => {
              characterManager.actions.setBlockMeta(
                pageIndex,
                sectionIndex,
                blockIndex,
                meta
              );
            }}
          />
        )}
        {block.type === BlockType.Text && (
          <BlockTextActions
            pageIndex={pageIndex}
            sectionIndex={sectionIndex}
            section={section}
            block={block}
            blockIndex={blockIndex}
            onMetaChange={(meta) => {
              characterManager.actions.setBlockMeta(
                pageIndex,
                sectionIndex,
                blockIndex,
                meta
              );
            }}
          />
        )}

        {block.type === BlockType.Skill && (
          <BlockSkillActions
            pageIndex={pageIndex}
            sectionIndex={sectionIndex}
            section={section}
            block={block}
            blockIndex={blockIndex}
            onMetaChange={(meta) => {
              characterManager.actions.setBlockMeta(
                pageIndex,
                sectionIndex,
                blockIndex,
                meta
              );
            }}
          />
        )}
        {block.type === BlockType.DicePool && (
          <BlockDicePoolActions
            pageIndex={pageIndex}
            sectionIndex={sectionIndex}
            section={section}
            block={block}
            blockIndex={blockIndex}
            onMetaChange={(meta) => {
              characterManager.actions.setBlockMeta(
                pageIndex,
                sectionIndex,
                blockIndex,
                meta
              );
            }}
          />
        )}

        <Grid item>
          <Link
            component="button"
            variant="caption"
            className={css({
              label: "CharacterDialog-duplicate",
              color: theme.palette.primary.main,
            })}
            onClick={() => {
              characterManager.actions.duplicateBlock(
                pageIndex,
                sectionIndex,
                block,
                blockIndex
              );
            }}
          >
            {/* TODO: text */}
            {"Duplicate"}
          </Link>
        </Grid>
        <Grid item>
          <Link
            component="button"
            variant="caption"
            className={css({
              label: "CharacterDialog-remove",
              color: theme.palette.primary.main,
            })}
            onClick={() => {
              characterManager.actions.removeBlock(
                pageIndex,
                sectionIndex,
                blockIndex
              );
            }}
          >
            {t("character-dialog.control.remove-field")}
          </Link>
        </Grid>
      </Grid>
    );
  }
};
CharacterV3Dialog.displayName = "CharacterV3Dialog";